import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  AppSettings,
  Car,
  FuelEntry,
  ServiceRecord,
} from "@/types";

export const DB_NAME = "car-companion";
export const DB_VERSION = 2;

export const STORES = {
  cars: "cars",
  fuelEntries: "fuelEntries",
  serviceRecords: "serviceRecords",
  settings: "settings",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export const SETTINGS_KEY = "app";

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "EUR",
  distanceUnit: "km",
  volumeUnit: "L",
  consumptionUnit: "l_100km",
  theme: "dark",
  accentColor: "teal",
  notifications: {
    serviceReminders: true,
    oilReminders: true,
    insuranceReminders: true,
    itpReminders: true,
    fuelReminders: false,
  },
};

interface CarCompanionDB extends DBSchema {
  cars: {
    key: string;
    value: Car;
    indexes: { "by-updated": string };
  };
  fuelEntries: {
    key: string;
    value: FuelEntry;
    indexes: { "by-car": string; "by-date": string };
  };
  serviceRecords: {
    key: string;
    value: ServiceRecord;
    indexes: {
      "by-car": string;
      "by-date": string;
      "by-completed": string;
    };
  };
  settings: {
    key: string;
    value: AppSettings & { id: string };
  };
}

let dbPromise: Promise<IDBPDatabase<CarCompanionDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<CarCompanionDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<CarCompanionDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains(STORES.cars)) {
          const cars = db.createObjectStore(STORES.cars, { keyPath: "id" });
          cars.createIndex("by-updated", "updatedAt");
        }

        if (!db.objectStoreNames.contains(STORES.fuelEntries)) {
          const fuel = db.createObjectStore(STORES.fuelEntries, {
            keyPath: "id",
          });
          fuel.createIndex("by-car", "carId");
          fuel.createIndex("by-date", "date");
        }

        if (!db.objectStoreNames.contains(STORES.serviceRecords)) {
          const service = db.createObjectStore(STORES.serviceRecords, {
            keyPath: "id",
          });
          service.createIndex("by-car", "carId");
          service.createIndex("by-date", "dateCompleted");
          service.createIndex("by-completed", "dateCompleted");
        } else if (oldVersion < 2) {
          const service = transaction.objectStore(STORES.serviceRecords);
          if (!service.indexNames.contains("by-completed")) {
            service.createIndex("by-completed", "dateCompleted");
          }
        }

        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, { keyPath: "id" });
        }
      },
    });
  }

  return dbPromise;
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const record = await db.get(STORES.settings, SETTINGS_KEY);

  if (!record) {
    return { ...DEFAULT_SETTINGS };
  }

  const { id: _id, ...rest } = record;
  void _id;

  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...rest.notifications,
    },
  };
}

export async function saveSettings(
  partial: Partial<AppSettings>,
): Promise<AppSettings> {
  const db = await getDatabase();
  const current = await getSettings();
  const next = { ...current, ...partial };
  await db.put(STORES.settings, { id: SETTINGS_KEY, ...next });
  return next;
}
