import type { Car, FuelEntry, FuelStats } from "@/types";
import { computeFuelStats } from "@/features/fuel/utils";
import { getCarDisplayName } from "@/features/cars/utils";

export type MonthSeriesPoint = {
  key: string;
  label: string;
  fuelCost: number;
  distance: number;
  liters: number;
  avgConsumption: number;
  avgPrice: number;
  stops: number;
};

export type ConsumptionTrendPoint = {
  key: string;
  label: string;
  consumption: number;
  date: string;
};

export type CostByVehiclePoint = {
  carId: string;
  name: string;
  value: number;
};

export type VehicleComparison = {
  carId: string;
  name: string;
  stats: FuelStats;
  stops: number;
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function groupByMonth(entries: FuelEntry[]): Map<string, FuelEntry[]> {
  const map = new Map<string, FuelEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = monthKey(date);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return map;
}

export function buildMonthlySeries(entries: FuelEntry[]): MonthSeriesPoint[] {
  const grouped = groupByMonth(entries);
  const keys = [...grouped.keys()].sort();

  return keys.map((key) => {
    const monthEntries = grouped.get(key) ?? [];
    const stats = computeFuelStats(monthEntries);
    const avgPrice =
      monthEntries.length > 0
        ? Math.round(
            (monthEntries.reduce((sum, e) => sum + e.pricePerLiter, 0) /
              monthEntries.length) *
              1000,
          ) / 1000
        : 0;

    return {
      key,
      label: monthLabel(key),
      fuelCost: stats.totalFuelCost,
      distance: stats.distanceTravelled,
      liters: stats.totalLiters,
      avgConsumption: stats.averageConsumption,
      avgPrice,
      stops: monthEntries.length,
    };
  });
}

export function buildConsumptionTrend(
  entries: FuelEntry[],
): ConsumptionTrendPoint[] {
  return [...entries]
    .filter((e) => e.consumption !== undefined && e.consumption > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      key: entry.id,
      label: new Date(entry.date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      }),
      consumption: entry.consumption ?? 0,
      date: entry.date,
    }));
}

export function buildCostByVehicle(
  entries: FuelEntry[],
  cars: Car[],
): CostByVehiclePoint[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.carId, (totals.get(entry.carId) ?? 0) + entry.totalCost);
  }

  return [...totals.entries()]
    .map(([carId, value]) => {
      const car = cars.find((c) => c.id === carId);
      return {
        carId,
        name: car ? getCarDisplayName(car) : "Unknown",
        value: Math.round(value * 100) / 100,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function buildVehicleComparisons(
  entries: FuelEntry[],
  cars: Car[],
): VehicleComparison[] {
  return cars
    .map((car) => {
      const carEntries = entries.filter((e) => e.carId === car.id);
      return {
        carId: car.id,
        name: getCarDisplayName(car),
        stats: computeFuelStats(carEntries),
        stops: carEntries.length,
      };
    })
    .filter((row) => row.stops > 0)
    .sort((a, b) => b.stats.totalFuelCost - a.stats.totalFuelCost);
}

export type MonthlyBreakdownRow = MonthSeriesPoint;

export type YearlyBreakdownRow = {
  key: string;
  label: string;
  fuelCost: number;
  distance: number;
  liters: number;
  avgConsumption: number;
  stops: number;
};

export function buildYearlyBreakdown(entries: FuelEntry[]): YearlyBreakdownRow[] {
  const map = new Map<string, FuelEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = String(date.getFullYear());
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }

  return [...map.keys()]
    .sort()
    .map((key) => {
      const yearEntries = map.get(key) ?? [];
      const stats = computeFuelStats(yearEntries);
      return {
        key,
        label: key,
        fuelCost: stats.totalFuelCost,
        distance: stats.distanceTravelled,
        liters: stats.totalLiters,
        avgConsumption: stats.averageConsumption,
        stops: yearEntries.length,
      };
    });
}

export function buildFuelCostHistory(entries: FuelEntry[]) {
  return [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((entry) => ({
      id: entry.id,
      date: entry.date,
      totalCost: entry.totalCost,
      liters: entry.liters,
      pricePerLiter: entry.pricePerLiter,
      station: undefined,
    }));
}

export function buildConsumptionHistory(entries: FuelEntry[]) {
  return [...entries]
    .filter((e) => e.consumption !== undefined && e.consumption > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((entry) => ({
      id: entry.id,
      date: entry.date,
      consumption: entry.consumption ?? 0,
      distance: entry.distanceSinceLastRefuel || 0,
      liters: entry.liters,
    }));
}
