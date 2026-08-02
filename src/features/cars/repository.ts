import { getDatabase, getSettings, saveSettings, STORES } from "@/lib/db";
import type { Car, CreateCarInput, UpdateCarInput } from "@/types";
import { createId } from "@/features/cars/utils";

function sortByUpdatedDesc(cars: Car[]) {
  return [...cars].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getCars(): Promise<Car[]> {
  const db = await getDatabase();
  const cars = await db.getAll(STORES.cars);
  return sortByUpdatedDesc(cars);
}

export async function getCar(id: string): Promise<Car | undefined> {
  const db = await getDatabase();
  return db.get(STORES.cars, id);
}

export async function createCar(input: CreateCarInput): Promise<Car> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const car: Car = {
    ...input,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };

  await db.put(STORES.cars, car);

  const settings = await getSettings();
  if (!settings.activeCarId) {
    await saveSettings({ activeCarId: car.id });
  }

  return car;
}

export async function updateCar(
  id: string,
  input: UpdateCarInput,
): Promise<Car> {
  const db = await getDatabase();
  const existing = await db.get(STORES.cars, id);

  if (!existing) {
    throw new Error("Vehicle not found");
  }

  const updated: Car = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORES.cars, updated);
  return updated;
}

export async function deleteCar(id: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.get(STORES.cars, id);

  if (!existing) {
    throw new Error("Vehicle not found");
  }

  await db.delete(STORES.cars, id);

  const settings = await getSettings();
  if (settings.activeCarId === id) {
    const remaining = await getCars();
    await saveSettings({
      activeCarId: remaining[0]?.id,
    });
  }
}

export async function setActiveCar(id: string): Promise<void> {
  const car = await getCar(id);
  if (!car) {
    throw new Error("Vehicle not found");
  }
  await saveSettings({ activeCarId: id });
}

export async function getActiveCar(): Promise<Car | undefined> {
  const settings = await getSettings();
  if (!settings.activeCarId) {
    const cars = await getCars();
    return cars[0];
  }
  return getCar(settings.activeCarId);
}

export async function getActiveCarId(): Promise<string | undefined> {
  const settings = await getSettings();
  if (settings.activeCarId) {
    return settings.activeCarId;
  }
  const cars = await getCars();
  return cars[0]?.id;
}
