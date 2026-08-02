import type { InsightContext, InsightEngineResult } from "@/features/insights/engine/types";
import { generateInsights } from "@/features/insights/engine/generator";

/**
 * Thin repository boundary — today insights are computed on device.
 * Later this can cache / sync without changing callers.
 */
export async function getInsights(
  ctx: InsightContext,
): Promise<InsightEngineResult> {
  return generateInsights(ctx);
}
