import type { Car, FuelEntry, FuelStats } from "@/types";
import { computeFuelStats, EMPTY_FUEL_STATS } from "@/features/fuel/utils";
import {
  DEFAULT_STATS_FILTERS,
  filterFuelEntries,
  type StatsFilters,
} from "@/features/statistics/services/filters";
import { generateInsights, type Insight } from "@/features/statistics/services/insights";
import {
  buildConsumptionHistory,
  buildConsumptionTrend,
  buildCostByVehicle,
  buildFuelCostHistory,
  buildMonthlySeries,
  buildVehicleComparisons,
  buildYearlyBreakdown,
  type CostByVehiclePoint,
  type ConsumptionTrendPoint,
  type MonthSeriesPoint,
  type VehicleComparison,
  type YearlyBreakdownRow,
} from "@/features/statistics/services/series";

export type StatisticsSnapshot = {
  filters: StatsFilters;
  filteredEntries: FuelEntry[];
  summary: FuelStats & { stops: number };
  monthly: MonthSeriesPoint[];
  consumptionTrend: ConsumptionTrendPoint[];
  costByVehicle: CostByVehiclePoint[];
  comparisons: VehicleComparison[];
  insights: Insight[];
  fuelCostHistory: ReturnType<typeof buildFuelCostHistory>;
  consumptionHistory: ReturnType<typeof buildConsumptionHistory>;
  yearlyBreakdown: YearlyBreakdownRow[];
};

export function buildStatisticsSnapshot(input: {
  entries: FuelEntry[];
  cars: Car[];
  filters?: StatsFilters;
  now?: Date;
}): StatisticsSnapshot {
  const filters = input.filters ?? DEFAULT_STATS_FILTERS;
  const filteredEntries = filterFuelEntries(
    input.entries,
    filters,
    input.now,
  );
  const stats = computeFuelStats(filteredEntries);
  const monthly = buildMonthlySeries(filteredEntries);

  return {
    filters,
    filteredEntries,
    summary: {
      ...stats,
      stops: filteredEntries.length,
    },
    monthly,
    consumptionTrend: buildConsumptionTrend(filteredEntries),
    costByVehicle: buildCostByVehicle(filteredEntries, input.cars),
    comparisons: buildVehicleComparisons(filteredEntries, input.cars),
    insights: generateInsights({
      entries: filteredEntries,
      stats,
      monthly,
    }),
    fuelCostHistory: buildFuelCostHistory(filteredEntries),
    consumptionHistory: buildConsumptionHistory(filteredEntries),
    yearlyBreakdown: buildYearlyBreakdown(filteredEntries),
  };
}

export const EMPTY_STATISTICS_SNAPSHOT: StatisticsSnapshot = {
  filters: DEFAULT_STATS_FILTERS,
  filteredEntries: [],
  summary: { ...EMPTY_FUEL_STATS, stops: 0 },
  monthly: [],
  consumptionTrend: [],
  costByVehicle: [],
  comparisons: [],
  insights: [],
  fuelCostHistory: [],
  consumptionHistory: [],
  yearlyBreakdown: [],
};
