import { getDatabase, STORES, saveSettings } from "@/lib/db";
import type { BackupPayload } from "@/types";
import {
  APP_NAME,
  APP_VERSION,
  BACKUP_SCHEMA_VERSION,
  BUILD_VERSION,
} from "@/features/settings/constants";
import { getAppSettings } from "@/features/settings/repository";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function createBackupPayload(): Promise<BackupPayload> {
  const db = await getDatabase();
  const [cars, fuelEntries, serviceRecords, settings] = await Promise.all([
    db.getAll(STORES.cars),
    db.getAll(STORES.fuelEntries),
    db.getAll(STORES.serviceRecords),
    getAppSettings(),
  ]);

  const exportedAt = new Date().toISOString();

  return {
    version: BACKUP_SCHEMA_VERSION,
    exportedAt,
    metadata: {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      buildVersion: BUILD_VERSION,
      exportedAt,
      schemaVersion: BACKUP_SCHEMA_VERSION,
    },
    cars,
    fuelEntries,
    serviceRecords,
    settings,
  };
}

export async function exportBackupJson(): Promise<BackupPayload> {
  const payload = await createBackupPayload();
  downloadJson(`car-companion-backup-${Date.now()}.json`, payload);
  await saveSettings({ lastBackupAt: payload.exportedAt });
  return payload;
}
