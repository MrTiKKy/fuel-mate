import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  AppSettings,
  Car,
  DocumentFileBlob,
  FuelEntry,
  ServiceRecord,
  VehicleDocument,
} from "@/types";

/** Keep legacy DB name so existing local data continues to work. */
export const DB_NAME = "car-companion";
export const DB_VERSION = 3;

export const STORES = {
  cars: "cars",
  fuelEntries: "fuelEntries",
  serviceRecords: "serviceRecords",
  documents: "documents",
  documentFiles: "documentFiles",
  settings: "settings",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export const SETTINGS_KEY = "app";

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "RON",
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

interface GaragePlusDB extends DBSchema {
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
  documents: {
    key: string;
    value: VehicleDocument;
    indexes: {
      "by-vehicle": string;
      "by-type": string;
      "by-expiry": string;
      "by-updated": string;
    };
  };
  documentFiles: {
    key: string;
    value: DocumentFileBlob;
    indexes: { "by-document": string };
  };
  settings: {
    key: string;
    value: AppSettings & { id: string };
  };
}

let dbPromise: Promise<IDBPDatabase<GaragePlusDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<GaragePlusDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<GaragePlusDB>(DB_NAME, DB_VERSION, {
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

        if (!db.objectStoreNames.contains(STORES.documents)) {
          const docs = db.createObjectStore(STORES.documents, {
            keyPath: "id",
          });
          docs.createIndex("by-vehicle", "vehicleId");
          docs.createIndex("by-type", "type");
          docs.createIndex("by-expiry", "expiryDate");
          docs.createIndex("by-updated", "updatedAt");
        }

        if (!db.objectStoreNames.contains(STORES.documentFiles)) {
          const files = db.createObjectStore(STORES.documentFiles, {
            keyPath: "id",
          });
          files.createIndex("by-document", "documentId");
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
