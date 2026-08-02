import { getDatabase, STORES, DEFAULT_SETTINGS } from "@/lib/db";
import type { AppSettings, ImportSummary } from "@/types";
import {
  parseBackupJson,
  type ValidatedBackup,
} from "@/features/settings/services/validation";

export async function readBackupFile(file: File): Promise<ValidatedBackup> {
  const text = await file.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  return parseBackupJson(raw);
}

export function summarizeBackup(backup: ValidatedBackup): ImportSummary {
  return {
    cars: backup.cars.length,
    fuelEntries: backup.fuelEntries.length,
    serviceRecords: backup.serviceRecords.length,
    settings: Boolean(backup.settings),
  };
}

export async function importBackup(
  backup: ValidatedBackup,
): Promise<ImportSummary> {
  const db = await getDatabase();
  const tx = db.transaction(
    [STORES.cars, STORES.fuelEntries, STORES.serviceRecords, STORES.settings],
    "readwrite",
  );

  await Promise.all([
    tx.objectStore(STORES.cars).clear(),
    tx.objectStore(STORES.fuelEntries).clear(),
    tx.objectStore(STORES.serviceRecords).clear(),
  ]);

  for (const car of backup.cars) {
    await tx.objectStore(STORES.cars).put(car as never);
  }
  for (const entry of backup.fuelEntries) {
    await tx.objectStore(STORES.fuelEntries).put(entry as never);
  }
  for (const record of backup.serviceRecords) {
    await tx.objectStore(STORES.serviceRecords).put(record as never);
  }

  const settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...backup.settings,
    consumptionUnit:
      backup.settings.consumptionUnit ?? DEFAULT_SETTINGS.consumptionUnit,
    accentColor: backup.settings.accentColor ?? DEFAULT_SETTINGS.accentColor,
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...backup.settings.notifications,
    },
    lastBackupAt: new Date().toISOString(),
  };

  await tx.objectStore(STORES.settings).put({ id: "app", ...settings });
  await tx.done;

  return summarizeBackup(backup);
}
