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

export function formatPricePerLiter(value: number, currency = "RON") {
  return `${value.toFixed(3)} ${currency}/L`;
}

export function formatConsumptionValue(value?: number) {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(2)} L/100km`;
}

/** Normalize legacy odometer-based entries into distanceSinceLastRefuel. */
export function normalizeFuelEntry(entry: FuelEntry): FuelEntry {
  const distance =
    entry.distanceSinceLastRefuel > 0
      ? entry.distanceSinceLastRefuel
      : 0;

  const metrics = calculateEntryMetrics({
    distanceSinceLastRefuel: distance,
    liters: entry.liters,
    totalCost: entry.totalCost,
    isFullTank: entry.isFullTank,
  });

  return {
    ...entry,
    distanceSinceLastRefuel: distance,
    consumption: entry.consumption ?? metrics.consumption,
    costPerKm: entry.costPerKm ?? metrics.costPerKm,
    costPer100Km: entry.costPer100Km ?? metrics.costPer100Km,
  };
}

export function calculateEntryMetrics(input: {
  distanceSinceLastRefuel: number;
  liters: number;
  totalCost: number;
  isFullTank: boolean;
}): {
  consumption?: number;
  costPerKm?: number;
  costPer100Km?: number;
} {
  const distance = input.distanceSinceLastRefuel;
  if (!Number.isFinite(distance) || distance <= 0) {
    return {};
  }

  const costPerKm =
    Math.round((input.totalCost / distance) * 1000) / 1000;
  const costPer100Km =
    Math.round((input.totalCost / distance) * 100 * 100) / 100;

  // Accurate consumption when full tank; still compute if distance known
  const consumption =
    input.liters > 0
      ? roundConsumption((input.liters / distance) * 100)
      : undefined;

  return {
    consumption: input.isFullTank ? consumption : undefined,
    costPerKm,
    costPer100Km,
  };
}

/**
 * @deprecated Prefer distance-based calculateEntryMetrics
 */
export function calculateFullTankConsumption(
  previous: Pick<FuelEntry, "odometer" | "isFullTank" | "distanceSinceLastRefuel">,
  current: Pick<
    FuelEntry,
    "odometer" | "liters" | "isFullTank" | "distanceSinceLastRefuel"
  >,
): number | undefined {
  if (current.distanceSinceLastRefuel > 0) {
    return calculateEntryMetrics({
      distanceSinceLastRefuel: current.distanceSinceLastRefuel,
      liters: current.liters,
      totalCost: 0,
      isFullTank: current.isFullTank,
    }).consumption;
  }

  if (!current.isFullTank || !previous.isFullTank) return undefined;
  if (previous.odometer == null || current.odometer == null) return undefined;

  const distance = current.odometer - previous.odometer;
  if (distance <= 0 || current.liters <= 0) return undefined;
  return roundConsumption((current.liters / distance) * 100);
}

export function resolveConsumptionForEntry(
  _entriesForCar: FuelEntry[],
  draft: Pick<
    FuelEntry,
    "distanceSinceLastRefuel" | "liters" | "isFullTank" | "totalCost"
  >,
): ReturnType<typeof calculateEntryMetrics> {
  return calculateEntryMetrics({
    distanceSinceLastRefuel: draft.distanceSinceLastRefuel,
    liters: draft.liters,
    totalCost: draft.totalCost,
    isFullTank: draft.isFullTank,
  });
}

/** Backfill distance from consecutive legacy odometer readings. */
export function backfillDistancesFromOdometer(
  entries: FuelEntry[],
): FuelEntry[] {
  const sorted = [...entries].sort((a, b) => {
    const aOdo = a.odometer ?? 0;
    const bOdo = b.odometer ?? 0;
    if (aOdo !== bOdo) return aOdo - bOdo;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return sorted.map((entry, index) => {
    if (entry.distanceSinceLastRefuel > 0) return entry;
    if (index === 0 || entry.odometer == null) {
      return { ...entry, distanceSinceLastRefuel: entry.distanceSinceLastRefuel || 0 };
    }
    const prev = sorted[index - 1];
    if (prev.odometer == null) {
      return { ...entry, distanceSinceLastRefuel: 0 };
    }
    const distance = entry.odometer - prev.odometer;
    return {
      ...entry,
      distanceSinceLastRefuel: distance > 0 ? distance : 0,
    };
  });
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

  const normalized = entries.map(normalizeFuelEntry);
  const totalFuelCost = normalized.reduce((sum, e) => sum + e.totalCost, 0);
  const totalLiters = normalized.reduce((sum, e) => sum + e.liters, 0);
  const distanceTravelled = normalized.reduce(
    (sum, e) => sum + (e.distanceSinceLastRefuel || 0),
    0,
  );

  const withConsumption = normalized.filter(
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
  const metrics = calculateEntryMetrics(parsed);
  return {
    carId: parsed.carId,
    date: parsed.date,
    distanceSinceLastRefuel: parsed.distanceSinceLastRefuel,
    liters: parsed.liters,
    pricePerLiter: parsed.pricePerLiter,
    totalCost: parsed.totalCost,
    fuelType: parsed.fuelType,
    isFullTank: parsed.isFullTank,
    notes: parsed.notes,
    consumption: metrics.consumption,
    costPerKm: metrics.costPerKm,
    costPer100Km: metrics.costPer100Km,
  };
}

export function fuelEntryToFormValues(entry: FuelEntry): FuelEntryFormValues {
  return {
    carId: entry.carId,
    date: entry.date.slice(0, 10),
    distanceSinceLastRefuel: String(entry.distanceSinceLastRefuel || ""),
    liters: entry.liters.toString(),
    pricePerLiter: entry.pricePerLiter.toString(),
    totalCost: entry.totalCost.toString(),
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
    distanceSinceLastRefuel: entry.distanceSinceLastRefuel || 0,
    liters: entry.liters,
    pricePerLiter: entry.pricePerLiter,
    totalCost: entry.totalCost,
    fuelType: entry.fuelType,
    isFullTank: entry.isFullTank,
    notes: entry.notes,
  };
}

/** Total km logged for a car after a given date (inclusive). */
export function sumDistanceSince(
  entries: FuelEntry[],
  carId: string,
  sinceDate: string,
): number {
  const since = new Date(sinceDate).getTime();
  return entries
    .filter(
      (entry) =>
        entry.carId === carId && new Date(entry.date).getTime() >= since,
    )
    .reduce((sum, entry) => sum + (entry.distanceSinceLastRefuel || 0), 0);
}

export const EMPTY_FUEL_STATS: FuelStats = {
  totalFuelCost: 0,
  totalLiters: 0,
  averageConsumption: 0,
  costPer100Km: 0,
  costPerKm: 0,
  distanceTravelled: 0,
};
