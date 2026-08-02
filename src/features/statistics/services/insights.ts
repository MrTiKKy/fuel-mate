import type { FuelEntry, FuelStats } from "@/types";
import type { MonthSeriesPoint } from "@/features/statistics/services/series";
import { formatCurrency, formatNumber } from "@/lib/formatters";

export type InsightTone = "positive" | "neutral" | "warning";

export type Insight = {
  id: string;
  title: string;
  description: string;
  tone: InsightTone;
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function generateInsights(input: {
  entries: FuelEntry[];
  stats: FuelStats;
  monthly: MonthSeriesPoint[];
  currency?: string;
}): Insight[] {
  const { entries, stats, monthly, currency = "EUR" } = input;
  const insights: Insight[] = [];

  if (entries.length === 0) return insights;

  const withConsumption = entries
    .filter((e) => e.consumption !== undefined && e.consumption > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (withConsumption.length >= 4) {
    const mid = Math.floor(withConsumption.length / 2);
    const first = average(
      withConsumption.slice(0, mid).map((e) => e.consumption ?? 0),
    );
    const second = average(
      withConsumption.slice(mid).map((e) => e.consumption ?? 0),
    );
    if (first > 0) {
      const delta = ((first - second) / first) * 100;
      if (Math.abs(delta) >= 3) {
        insights.push({
          id: "consumption-trend",
          title:
            delta > 0
              ? `Consumption improved by ${Math.abs(delta).toFixed(0)}%`
              : `Consumption rose by ${Math.abs(delta).toFixed(0)}%`,
          description:
            delta > 0
              ? "Recent full-tank readings are more efficient than earlier ones."
              : "Recent full-tank readings use more fuel than earlier ones.",
          tone: delta > 0 ? "positive" : "warning",
        });
      }
    }
  }

  if (monthly.length > 0) {
    const expensive = [...monthly].sort((a, b) => b.fuelCost - a.fuelCost)[0];
    if (expensive.fuelCost > 0) {
      insights.push({
        id: "expensive-month",
        title: `Most expensive month was ${expensive.label}`,
        description: `You spent ${formatCurrency(expensive.fuelCost, currency)} on fuel that month.`,
        tone: "neutral",
      });
    }
  }

  if (stats.totalLiters > 0 && entries.length > 0) {
    const avgStop = stats.totalLiters / entries.length;
    insights.push({
      id: "avg-stop",
      title: `Average fuel stop is ${formatNumber(avgStop, "en-US", 0)} L`,
      description: `Across ${entries.length} fill-up${entries.length === 1 ? "" : "s"}.`,
      tone: "neutral",
    });
  }

  const year = new Date().getFullYear();
  const yearEntries = entries.filter(
    (e) => new Date(e.date).getFullYear() === year,
  );
  if (yearEntries.length > 0) {
    const yearSpend = yearEntries.reduce((sum, e) => sum + e.totalCost, 0);
    insights.push({
      id: "year-spend",
      title: `You spent ${formatCurrency(yearSpend, currency)} on fuel this year`,
      description: `${yearEntries.length} stops recorded in ${year}.`,
      tone: "neutral",
    });
  }

  const sorted = [...entries].sort((a, b) => a.odometer - b.odometer);
  let longestGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].odometer - sorted[i - 1].odometer;
    if (gap > longestGap) longestGap = gap;
  }
  if (longestGap > 0) {
    insights.push({
      id: "longest-gap",
      title: `Longest trip between fill-ups was ${formatNumber(longestGap, "en-US", 0)} km`,
      description: "Based on consecutive odometer readings.",
      tone: "positive",
    });
  }

  return insights.slice(0, 6);
}
