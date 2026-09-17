"use client";

import { getDatabase, STORES } from "@/lib/db";
import {
  fetchCloudSnapshot,
  type CloudSnapshot,
} from "@/lib/cloud/client-snapshot";

/**
 * Replace local IndexedDB domain stores with the authenticated user's Neon snapshot.
 * Keeps a local cache for the existing UI repositories; source of truth is Neon.
 * Does not delete unrelated browser DBs; overwrites Garage+ object stores.
 */
export async function hydrateIndexedDbFromCloud(
  snapshot?: CloudSnapshot,
): Promise<void> {
  const data = snapshot ?? (await fetchCloudSnapshot(true));
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
    // Keep document file blobs locally if present; cloud bytes are MVP in Neon.
    // We clear metadata docs; files without matching docs become orphans — clear too.
    tx.objectStore(STORES.documentFiles).clear(),
    tx.objectStore(STORES.savedCalculations).clear(),
  ]);

  for (const car of data.cars) {
    await tx.objectStore(STORES.cars).put(car);
  }
  for (const entry of data.fuelEntries) {
    await tx.objectStore(STORES.fuelEntries).put(entry);
  }
  for (const record of data.serviceRecords) {
    await tx.objectStore(STORES.serviceRecords).put(record);
  }
  for (const doc of data.documents) {
    await tx.objectStore(STORES.documents).put(doc);
  }
  for (const calc of data.savedCalculations) {
    await tx.objectStore(STORES.savedCalculations).put(calc);
  }

  if (data.settings) {
    await tx.objectStore(STORES.settings).put({ id: "app", ...data.settings });
  }

  await tx.done;
}
