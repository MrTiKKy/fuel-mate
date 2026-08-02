import { getDatabase, STORES } from "@/lib/db";
import type {
  CreateFuelEntryInput,
  FuelEntry,
  UpdateFuelEntryInput,
} from "@/types";
import {
  backfillDistancesFromOdometer,
  calculateEntryMetrics,
  createId,
  normalizeFuelEntry,
} from "@/features/fuel/utils";

function sortByNewest(entries: FuelEntry[]) {
  return [...entries].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function getEntriesForCar(carId: string): Promise<FuelEntry[]> {
  const db = await getDatabase();
  const entries = await db.getAllFromIndex(STORES.fuelEntries, "by-car", carId);
  return backfillDistancesFromOdometer(entries).map(normalizeFuelEntry);
}

export async function getFuelEntries(): Promise<FuelEntry[]> {
  const db = await getDatabase();
  const entries = await db.getAll(STORES.fuelEntries);
  const byCar = new Map<string, FuelEntry[]>();
  for (const entry of entries) {
    const list = byCar.get(entry.carId) ?? [];
    list.push(entry);
    byCar.set(entry.carId, list);
  }
  const normalized: FuelEntry[] = [];
  for (const list of byCar.values()) {
    normalized.push(
      ...backfillDistancesFromOdometer(list).map(normalizeFuelEntry),
    );
  }
  return sortByNewest(normalized);
}

export async function getFuelEntriesByCar(carId: string): Promise<FuelEntry[]> {
  const entries = await getEntriesForCar(carId);
  return sortByNewest(entries);
}

export async function getFuelEntry(id: string): Promise<FuelEntry | undefined> {
  const db = await getDatabase();
  const entry = await db.get(STORES.fuelEntries, id);
  return entry ? normalizeFuelEntry(entry) : undefined;
}

export async function createFuelEntry(
  input: CreateFuelEntryInput,
): Promise<FuelEntry> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = createId();
  const metrics = calculateEntryMetrics(input);

  const entry: FuelEntry = {
    ...input,
    id,
    consumption: metrics.consumption,
    costPerKm: metrics.costPerKm,
    costPer100Km: metrics.costPer100Km,
    createdAt: now,
    updatedAt: now,
  };

  await db.put(STORES.fuelEntries, entry);
  return entry;
}

export async function updateFuelEntry(
  id: string,
  input: UpdateFuelEntryInput,
): Promise<FuelEntry> {
  const db = await getDatabase();
  const existing = await db.get(STORES.fuelEntries, id);

  if (!existing) {
    throw new Error("Fuel entry not found");
  }

  const nextBase: FuelEntry = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const metrics = calculateEntryMetrics(nextBase);
  const next: FuelEntry = {
    ...nextBase,
    consumption: metrics.consumption,
    costPerKm: metrics.costPerKm,
    costPer100Km: metrics.costPer100Km,
  };

  await db.put(STORES.fuelEntries, next);
  return next;
}

export async function deleteFuelEntry(id: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.get(STORES.fuelEntries, id);

  if (!existing) {
    throw new Error("Fuel entry not found");
  }

  await db.delete(STORES.fuelEntries, id);
}

/** Total distance logged for a car (sum of trip distances). */
export async function getCarDistanceTotal(carId: string): Promise<number> {
  const entries = await getEntriesForCar(carId);
  return entries.reduce(
    (sum, entry) => sum + (entry.distanceSinceLastRefuel || 0),
    0,
  );
}
