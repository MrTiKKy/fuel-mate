import { getDatabase, STORES } from "@/lib/db";
import type {
  CreateFuelEntryInput,
  FuelEntry,
  UpdateFuelEntryInput,
} from "@/types";
import {
  createId,
  findPreviousEntry,
  resolveConsumptionForEntry,
} from "@/features/fuel/utils";

function sortByNewest(entries: FuelEntry[]) {
  return [...entries].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    if (b.odometer !== a.odometer) return b.odometer - a.odometer;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortByOdometerAsc(entries: FuelEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.odometer !== b.odometer) return a.odometer - b.odometer;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

async function getEntriesForCar(carId: string): Promise<FuelEntry[]> {
  const db = await getDatabase();
  return db.getAllFromIndex(STORES.fuelEntries, "by-car", carId);
}

function assertOdometerValid(
  entries: FuelEntry[],
  odometer: number,
  excludeId?: string,
) {
  const previous = findPreviousEntry(entries, odometer, excludeId);

  if (previous && odometer < previous.odometer) {
    throw new Error(
      `Odometer must be at least ${previous.odometer} km (previous entry)`,
    );
  }

  if (!excludeId) {
    const maxOdo = entries.reduce((max, e) => Math.max(max, e.odometer), 0);
    if (entries.length > 0 && odometer < maxOdo) {
      throw new Error(`Odometer must be at least ${maxOdo} km`);
    }
  } else {
    const others = entries.filter((e) => e.id !== excludeId);
    const prior = others
      .filter((e) => e.odometer <= odometer)
      .sort((a, b) => b.odometer - a.odometer)[0];
    if (prior && odometer < prior.odometer) {
      throw new Error(`Odometer must be at least ${prior.odometer} km`);
    }
  }
}

export async function getFuelEntries(): Promise<FuelEntry[]> {
  const db = await getDatabase();
  const entries = await db.getAll(STORES.fuelEntries);
  return sortByNewest(entries);
}

export async function getFuelEntriesByCar(carId: string): Promise<FuelEntry[]> {
  const entries = await getEntriesForCar(carId);
  return sortByNewest(entries);
}

export async function getFuelEntry(id: string): Promise<FuelEntry | undefined> {
  const db = await getDatabase();
  return db.get(STORES.fuelEntries, id);
}

export async function createFuelEntry(
  input: CreateFuelEntryInput,
): Promise<FuelEntry> {
  const db = await getDatabase();
  const carEntries = await getEntriesForCar(input.carId);

  assertOdometerValid(carEntries, input.odometer);

  const now = new Date().toISOString();
  const id = createId();
  const consumption = resolveConsumptionForEntry(carEntries, {
    ...input,
    id,
  });

  const entry: FuelEntry = {
    ...input,
    id,
    consumption,
    createdAt: now,
    updatedAt: now,
  };

  await db.put(STORES.fuelEntries, entry);
  await recalculateCarConsumptions(input.carId);

  return (await db.get(STORES.fuelEntries, id)) ?? entry;
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

  const next: FuelEntry = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const carEntries = await getEntriesForCar(next.carId);
  assertOdometerValid(carEntries, next.odometer, id);

  next.consumption = resolveConsumptionForEntry(carEntries, next);

  await db.put(STORES.fuelEntries, next);
  await recalculateCarConsumptions(next.carId);

  return (await db.get(STORES.fuelEntries, id)) ?? next;
}

export async function deleteFuelEntry(id: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.get(STORES.fuelEntries, id);

  if (!existing) {
    throw new Error("Fuel entry not found");
  }

  const carId = existing.carId;
  await db.delete(STORES.fuelEntries, id);
  await recalculateCarConsumptions(carId);
}

async function recalculateCarConsumptions(carId: string): Promise<void> {
  const db = await getDatabase();
  const entries = sortByOdometerAsc(await getEntriesForCar(carId));

  for (const entry of entries) {
    const consumption = resolveConsumptionForEntry(
      entries.filter((e) => e.id !== entry.id),
      entry,
    );

    if (entry.consumption !== consumption) {
      await db.put(STORES.fuelEntries, {
        ...entry,
        consumption,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export async function getPreviousOdometer(
  carId: string,
  excludeId?: string,
): Promise<number | undefined> {
  const entries = await getEntriesForCar(carId);
  const filtered = entries.filter((e) => e.id !== excludeId);
  if (filtered.length === 0) return undefined;
  return Math.max(...filtered.map((e) => e.odometer));
}
