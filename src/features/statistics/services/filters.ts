import type { FuelEntry } from "@/types";

export type StatsPeriod =
  | "all"
  | "last30"
  | "last90"
  | "year"
  | "custom";

export type StatsFilters = {
  carId: string | "all";
  period: StatsPeriod;
  customFrom?: string;
  customTo?: string;
};

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function resolveDateRange(
  filters: StatsFilters,
  now = new Date(),
): DateRange {
  switch (filters.period) {
    case "last30": {
      const from = startOfDay(new Date(now));
      from.setDate(from.getDate() - 29);
      return { from, to: endOfDay(now) };
    }
    case "last90": {
      const from = startOfDay(new Date(now));
      from.setDate(from.getDate() - 89);
      return { from, to: endOfDay(now) };
    }
    case "year": {
      const from = startOfDay(new Date(now.getFullYear(), 0, 1));
      return { from, to: endOfDay(now) };
    }
    case "custom": {
      const from = filters.customFrom
        ? startOfDay(new Date(filters.customFrom))
        : null;
      const to = filters.customTo
        ? endOfDay(new Date(filters.customTo))
        : null;
      return { from, to };
    }
    case "all":
    default:
      return { from: null, to: null };
  }
}

export function filterFuelEntries(
  entries: FuelEntry[],
  filters: StatsFilters,
  now = new Date(),
): FuelEntry[] {
  const range = resolveDateRange(filters, now);

  return entries.filter((entry) => {
    if (filters.carId !== "all" && entry.carId !== filters.carId) {
      return false;
    }

    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return false;

    if (range.from && date < range.from) return false;
    if (range.to && date > range.to) return false;

    return true;
  });
}

export const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 90 days" },
  { value: "year", label: "Current year" },
  { value: "custom", label: "Custom range" },
];

export const DEFAULT_STATS_FILTERS: StatsFilters = {
  carId: "all",
  period: "year",
};
