import { getDatabase, STORES, saveSettings, DEFAULT_SETTINGS } from "@/lib/db";

export {
  createBackupPayload,
  exportBackupJson,
} from "@/features/settings/services/export";

export {
  readBackupFile,
  summarizeBackup,
  importBackup,
} from "@/features/settings/services/import";

export async function resetDatabase(): Promise<void> {
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
    tx.objectStore(STORES.settings).clear(),
  ]);
  await tx.done;
  await saveSettings({ ...DEFAULT_SETTINGS });
}

export async function deleteAllFuelEntries(): Promise<number> {
  const db = await getDatabase();
  const entries = await db.getAll(STORES.fuelEntries);
  const tx = db.transaction(STORES.fuelEntries, "readwrite");
  await tx.store.clear();
  await tx.done;
  return entries.length;
}

export async function deleteAllServiceRecords(): Promise<number> {
  const db = await getDatabase();
  const records = await db.getAll(STORES.serviceRecords);
  const tx = db.transaction(STORES.serviceRecords, "readwrite");
  await tx.store.clear();
  await tx.done;
  return records.length;
}

export async function deleteAllDocuments(): Promise<number> {
  const db = await getDatabase();
  const documents = await db.getAll(STORES.documents);
  const tx = db.transaction(
    [STORES.documents, STORES.documentFiles],
    "readwrite",
  );
  await tx.objectStore(STORES.documents).clear();
  await tx.objectStore(STORES.documentFiles).clear();
  await tx.done;
  return documents.length;
}
