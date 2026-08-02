import type { InsightRule } from "@/features/insights/engine/types";

const rules: InsightRule[] = [];

/** Register an insight rule. Safe to call at module load. */
export function registerInsightRule(rule: InsightRule) {
  if (rules.some((item) => item.id === rule.id)) return;
  rules.push(rule);
}

export function getRegisteredInsightRules(): readonly InsightRule[] {
  return rules;
}
