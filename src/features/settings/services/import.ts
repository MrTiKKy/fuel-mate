import { getDatabase, STORES, DEFAULT_SETTINGS } from "@/lib/db";
import type {
  AppSettings,
  DocumentFileBlob,
  ImportSummary,
} from "@/types";
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
    documents: backup.documents.length,
    savedCalculations: backup.savedCalculations.length,
    settings: Boolean(backup.settings),
  };
}

function base64ToBlob(dataBase64: string, mimeType: string): Blob {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function importBackup(
  backup: ValidatedBackup,
): Promise<ImportSummary> {
  const db = await getDatabase();
  const tx = db.transaction(
    [
      STORES.cars,
      STORES.fuelEntries,
      STORES.serviceRecords,
      STORES.documents,
      STORES.documentFiles,
      STORES.savedCalculations,
      STORES.settings,
    ],
    "readwrite",
  );

  await Promise.all([
    tx.objectStore(STORES.cars).clear(),
    tx.objectStore(STORES.fuelEntries).clear(),
    tx.objectStore(STORES.serviceRecords).clear(),
    tx.objectStore(STORES.documents).clear(),
    tx.objectStore(STORES.documentFiles).clear(),
    tx.objectStore(STORES.savedCalculations).clear(),
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
  for (const document of backup.documents) {
    await tx.objectStore(STORES.documents).put(document as never);
  }
  for (const file of backup.documentFiles ?? []) {
    const record: DocumentFileBlob = {
      id: file.id,
      documentId: file.documentId,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt,
      blob: base64ToBlob(file.dataBase64, file.mimeType),
    };
    await tx.objectStore(STORES.documentFiles).put(record);
  }
  for (const saved of backup.savedCalculations) {
    await tx.objectStore(STORES.savedCalculations).put(saved as never);
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
