import {
  getDatabase,
  getSettings,
  SETTINGS_KEY,
  STORES,
} from "@/lib/db";
import type { AppSettings, DatabaseStats } from "@/types";

export async function getAppSettings(): Promise<AppSettings> {
  return getSettings();
}

export async function updateAppSettings(
  partial: Partial<AppSettings>,
): Promise<AppSettings> {
  const db = await getDatabase();
  const current = await getSettings();
  const next: AppSettings = {
    ...current,
    ...partial,
    notifications: partial.notifications
      ? { ...current.notifications, ...partial.notifications }
      : current.notifications,
  };

  if ("activeCarId" in partial && partial.activeCarId === undefined) {
    delete next.activeCarId;
  }
  if ("preferredFuelType" in partial && partial.preferredFuelType === undefined) {
    delete next.preferredFuelType;
  }
  if (
    "defaultTankCapacity" in partial &&
    partial.defaultTankCapacity === undefined
  ) {
    delete next.defaultTankCapacity;
  }
  if ("lastBackupAt" in partial && partial.lastBackupAt === undefined) {
    delete next.lastBackupAt;
  }

  await db.put(STORES.settings, { id: SETTINGS_KEY, ...next });
  return next;
}

export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    const db = await getDatabase();
    const [cars, fuelEntries, serviceRecords, settings] = await Promise.all([
      db.getAll(STORES.cars),
      db.getAll(STORES.fuelEntries),
      db.getAll(STORES.serviceRecords),
      getSettings(),
    ]);

    const payload = JSON.stringify({
      cars,
      fuelEntries,
      serviceRecords,
      settings,
    });

    const estimatedSizeBytes = new Blob([payload]).size;
    const total =
      cars.length + fuelEntries.length + serviceRecords.length;

    return {
      cars: cars.length,
      fuelEntries: fuelEntries.length,
      serviceRecords: serviceRecords.length,
      estimatedSizeBytes,
      lastBackupAt: settings.lastBackupAt,
      status: total === 0 ? "empty" : "ok",
    };
  } catch {
    return {
      cars: 0,
      fuelEntries: 0,
      serviceRecords: 0,
      estimatedSizeBytes: 0,
      status: "error",
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
