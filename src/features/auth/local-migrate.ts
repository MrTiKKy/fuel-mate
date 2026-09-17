import { getDatabase, STORES } from "@/lib/db";
import type { BackupDocumentFile } from "@/types";

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

/** Build migrate payload from current IndexedDB (does not delete local data). */
export async function collectLocalMigratePayload() {
  const db = await getDatabase();
  const [
    cars,
    fuelEntries,
    serviceRecords,
    documents,
    files,
    savedCalculations,
    settingsRow,
  ] = await Promise.all([
    db.getAll(STORES.cars),
    db.getAll(STORES.fuelEntries),
    db.getAll(STORES.serviceRecords),
    db.getAll(STORES.documents),
    db.getAll(STORES.documentFiles),
    db.getAll(STORES.savedCalculations),
    db.get(STORES.settings, "app"),
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

  const { id: _id, ...settings } = settingsRow ?? {};
  void _id;

  const localCount =
    cars.length +
    fuelEntries.length +
    serviceRecords.length +
    documents.length +
    savedCalculations.length;

  return {
    cars,
    fuelEntries,
    serviceRecords,
    documents,
    documentFiles,
    savedCalculations,
    settings: settingsRow ? settings : null,
    localCount,
  };
}

export const MIGRATION_FLAG_PREFIX = "garage-plus:migration-completed:";

export function migrationFlagKey(userId: string) {
  return `${MIGRATION_FLAG_PREFIX}${userId}`;
}

export function isMigrationCompleted(userId: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(migrationFlagKey(userId)) === "1";
}

export function markMigrationCompleted(userId: string, migratedAt: string) {
  localStorage.setItem(migrationFlagKey(userId), "1");
  localStorage.setItem(
    `garage-plus:migration-at:${userId}`,
    migratedAt,
  );
  localStorage.setItem("garage-plus:data-mode", "cloud");
}

export function getDataMode(): "local" | "cloud" {
  if (typeof window === "undefined") return "local";
  if (localStorage.getItem("garage-plus:data-mode") === "cloud") return "cloud";
  return "local";
}
