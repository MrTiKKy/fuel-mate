import { getDatabase, STORES, saveSettings } from "@/lib/db";
import type { BackupDocumentFile, BackupPayload } from "@/types";
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

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function createBackupPayload(): Promise<BackupPayload> {
  const db = await getDatabase();
  const [
    cars,
    fuelEntries,
    serviceRecords,
    documents,
    files,
    savedCalculations,
    settings,
  ] = await Promise.all([
    db.getAll(STORES.cars),
    db.getAll(STORES.fuelEntries),
    db.getAll(STORES.serviceRecords),
    db.getAll(STORES.documents),
    db.getAll(STORES.documentFiles),
    db.getAll(STORES.savedCalculations),
    getAppSettings(),
  ]);

  const documentFiles: BackupDocumentFile[] = await Promise.all(
    files.map(async (file) => ({
      id: file.id,
      documentId: file.documentId,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt,
      dataBase64: await blobToBase64(file.blob),
    })),
  );

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
    documents,
    documentFiles,
    savedCalculations,
    settings,
  };
}

export async function exportBackupJson(): Promise<BackupPayload> {
  const payload = await createBackupPayload();
  downloadJson(`garage-plus-backup-${Date.now()}.json`, payload);
  await saveSettings({ lastBackupAt: payload.exportedAt });
  return payload;
}
