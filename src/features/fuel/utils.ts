import type {
  CreateFuelEntryInput,
  FuelEntry,
  FuelStats,
} from "@/types";
import type { FuelEntryFormValues } from "@/lib/validations/fuel";
import {
  parseFuelEntryFormValues,
  roundConsumption,
} from "@/lib/validations/fuel";
import { createId } from "@/features/cars/utils";
import { FUEL_TYPE_LABELS } from "@/features/cars/constants";

export { createId };

export function getFuelTypeLabel(fuelType: FuelEntry["fuelType"]) {
  return FUEL_TYPE_LABELS[fuelType] ?? fuelType;
}

export function formatFuelDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export function formatLiters(value: number) {
  return `${value.toFixed(2)} L`;
}

export function formatPricePerLiter(value: number, currency = "EUR") {
  return `${value.toFixed(3)} ${currency}/L`;
}

export function formatConsumptionValue(value?: number) {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(2)} L/100km`;
}

/**
 * Consumption between two consecutive full-tank entries:
 * (liters / distance) × 100
 */
export function calculateFullTankConsumption(
  previous: Pick<FuelEntry, "odometer" | "isFullTank">,
  current: Pick<FuelEntry, "odometer" | "liters" | "isFullTank">,
): number | undefined {
  if (!current.isFullTank || !previous.isFullTank) {
    return undefined;
  }

  const distance = current.odometer - previous.odometer;
  if (distance <= 0 || current.liters <= 0) {
    return undefined;
  }

  return roundConsumption((current.liters / distance) * 100);
}

/**
 * Find the previous entry by odometer for a car (excluding an optional id).
 * Entries should already belong to one car.
 */
export function findPreviousEntry(
  entries: FuelEntry[],
  odometer: number,
  excludeId?: string,
): FuelEntry | undefined {
  const candidates = entries
    .filter((entry) => entry.id !== excludeId && entry.odometer <= odometer)
    .sort((a, b) => {
      if (b.odometer !== a.odometer) return b.odometer - a.odometer;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Prefer strictly lower odometer when possible
  const lower = candidates.find((entry) => entry.odometer < odometer);
  return lower ?? candidates[0];
}

export function resolveConsumptionForEntry(
  entriesForCar: FuelEntry[],
  draft: Pick<FuelEntry, "odometer" | "liters" | "isFullTank"> & {
    id?: string;
  },
): number | undefined {
  if (!draft.isFullTank) return undefined;

  const previous = findPreviousEntry(
    entriesForCar,
    draft.odometer,
    draft.id,
  );

  if (!previous) return undefined;

  return calculateFullTankConsumption(previous, draft);
}

export function computeFuelStats(entries: FuelEntry[]): FuelStats {
  if (entries.length === 0) {
    return {
      totalFuelCost: 0,
      totalLiters: 0,
      averageConsumption: 0,
      costPer100Km: 0,
      costPerKm: 0,
      distanceTravelled: 0,
    };
  }

  const totalFuelCost = entries.reduce((sum, e) => sum + e.totalCost, 0);
  const totalLiters = entries.reduce((sum, e) => sum + e.liters, 0);

  const sorted = [...entries].sort((a, b) => a.odometer - b.odometer);
  const distanceTravelled = Math.max(
    0,
    sorted[sorted.length - 1].odometer - sorted[0].odometer,
  );

  const withConsumption = entries.filter(
    (e) => e.consumption !== undefined && e.consumption > 0,
  );
  const averageConsumption =
    withConsumption.length > 0
      ? roundConsumption(
          withConsumption.reduce((sum, e) => sum + (e.consumption ?? 0), 0) /
            withConsumption.length,
        )
      : 0;

  const costPerKm =
    distanceTravelled > 0
      ? Math.round((totalFuelCost / distanceTravelled) * 1000) / 1000
      : 0;
  const costPer100Km =
    distanceTravelled > 0
      ? Math.round((totalFuelCost / distanceTravelled) * 100 * 100) / 100
      : 0;

  return {
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    totalLiters: Math.round(totalLiters * 100) / 100,
    averageConsumption,
    costPer100Km,
    costPerKm,
    distanceTravelled,
  };
}

export function formValuesToFuelInput(
  values: FuelEntryFormValues,
): CreateFuelEntryInput {
  const parsed = parseFuelEntryFormValues(values);
  return {
    carId: parsed.carId,
    date: parsed.date,
    odometer: parsed.odometer,
    liters: parsed.liters,
    pricePerLiter: parsed.pricePerLiter,
    totalCost: parsed.totalCost,
    fuelStation: parsed.fuelStation,
    fuelType: parsed.fuelType,
    isFullTank: parsed.isFullTank,
    notes: parsed.notes,
  };
}

export function fuelEntryToFormValues(entry: FuelEntry): FuelEntryFormValues {
  return {
    carId: entry.carId,
    date: entry.date.slice(0, 10),
    odometer: entry.odometer.toString(),
    liters: entry.liters.toString(),
    pricePerLiter: entry.pricePerLiter.toString(),
    totalCost: entry.totalCost.toString(),
    fuelStation: entry.fuelStation ?? "",
    fuelType: entry.fuelType,
    isFullTank: entry.isFullTank,
    notes: entry.notes ?? "",
  };
}

export function duplicateFuelEntryInput(
  entry: FuelEntry,
): CreateFuelEntryInput {
  return {
    carId: entry.carId,
    date: new Date().toISOString().slice(0, 10),
    odometer: entry.odometer,
    liters: entry.liters,
    pricePerLiter: entry.pricePerLiter,
    totalCost: entry.totalCost,
    fuelStation: entry.fuelStation,
    fuelType: entry.fuelType,
    isFullTank: entry.isFullTank,
    notes: entry.notes,
  };
}

export const EMPTY_FUEL_STATS: FuelStats = {
  totalFuelCost: 0,
  totalLiters: 0,
  averageConsumption: 0,
  costPer100Km: 0,
  costPerKm: 0,
  distanceTravelled: 0,
};
