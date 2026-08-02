import { getDatabase, STORES } from "@/lib/db";
import type {
  CreateServiceInput,
  ServiceRecord,
  UpdateServiceInput,
} from "@/types";
import { createId } from "@/features/service/utils";

function sortNewest(records: ServiceRecord[]) {
  return [...records].sort(
    (a, b) =>
      new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime(),
  );
}

export async function getServiceRecords(): Promise<ServiceRecord[]> {
  const db = await getDatabase();
  const records = await db.getAll(STORES.serviceRecords);
  return sortNewest(records);
}

export async function getServiceRecordsByCar(
  carId: string,
): Promise<ServiceRecord[]> {
  const db = await getDatabase();
  const records = await db.getAllFromIndex(
    STORES.serviceRecords,
    "by-car",
    carId,
  );
  return sortNewest(records);
}

export async function getServiceRecord(
  id: string,
): Promise<ServiceRecord | undefined> {
  const db = await getDatabase();
  return db.get(STORES.serviceRecords, id);
}

export async function createServiceRecord(
  input: CreateServiceInput,
): Promise<ServiceRecord> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const record: ServiceRecord = {
    ...input,
    attachments: input.attachments ?? [],
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.put(STORES.serviceRecords, record);
  return record;
}

export async function updateServiceRecord(
  id: string,
  input: UpdateServiceInput,
): Promise<ServiceRecord> {
  const db = await getDatabase();
  const existing = await db.get(STORES.serviceRecords, id);
  if (!existing) {
    throw new Error("Service record not found");
  }

  const updated: ServiceRecord = {
    ...existing,
    ...input,
    id: existing.id,
    attachments: input.attachments ?? existing.attachments,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORES.serviceRecords, updated);
  return updated;
}

export async function deleteServiceRecord(id: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.get(STORES.serviceRecords, id);
  if (!existing) {
    throw new Error("Service record not found");
  }
  await db.delete(STORES.serviceRecords, id);
}
