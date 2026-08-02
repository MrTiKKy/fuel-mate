import "@/features/insights/rules";
import { getRegisteredInsightRules } from "@/features/insights/engine/registry";
import type {
  InsightContext,
  InsightEngineResult,
} from "@/features/insights/engine/types";
import type { InsightsUnlockStatus } from "@/types";

const MIN_MONTHS = 3;
const MIN_EXPENSES = 10;
const MIN_FUEL = 10;

export function evaluateUnlockStatus(
  ctx: InsightContext,
): InsightsUnlockStatus {
  const fuelEntries = ctx.fuelEntries.length;
  const expenses = fuelEntries + ctx.serviceRecords.length;

  const timestamps = [
    ...ctx.fuelEntries.map((e) => new Date(e.date).getTime()),
    ...ctx.serviceRecords.map((r) => new Date(r.dateCompleted).getTime()),
  ].filter((t) => Number.isFinite(t));

  let monthsOfData = 0;
  if (timestamps.length > 0) {
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps, ctx.now.getTime());
    monthsOfData = Math.max(
      1,
      Math.round((max - min) / (1000 * 60 * 60 * 24 * 30)),
    );
  }

  const unlocked =
    monthsOfData >= MIN_MONTHS ||
    expenses >= MIN_EXPENSES ||
    fuelEntries >= MIN_FUEL;

  return {
    unlocked,
    fuelEntries,
    expenses,
    monthsOfData,
    reason: unlocked
      ? undefined
      : "Keep using Garage+ to unlock personalized insights.",
  };
}

/**
 * Insight Generator — runs all registered rules against local data.
 * Add new rules via registerInsightRule() without changing this file.
 */
export function generateInsights(ctx: InsightContext): InsightEngineResult {
  const unlock = evaluateUnlockStatus(ctx);
  if (!unlock.unlocked) {
    return { unlock, insights: [], featured: null };
  }

  const insights = getRegisteredInsightRules()
    .map((rule) => {
      try {
        return rule.evaluate(ctx);
      } catch {
        return null;
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      const rank = { critical: 0, warning: 1, info: 2, positive: 3 };
      return rank[a.severity] - rank[b.severity];
    });

  return {
    unlock,
    insights,
    featured: insights[0] ?? null,
  };
}
