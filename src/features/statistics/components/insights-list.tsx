import type { Insight } from "@/features/statistics/services/insights";
import { cn } from "@/lib/utils";

type InsightsListProps = {
  insights: Insight[];
};

export function InsightsList({ insights }: InsightsListProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            "rounded-2xl border px-4 py-3.5",
            insight.tone === "positive" &&
              "border-success/30 bg-success/10",
            insight.tone === "warning" &&
              "border-warning/30 bg-warning/10",
            insight.tone === "neutral" &&
              "border-border/70 bg-card",
          )}
        >
          <p className="text-sm font-medium tracking-tight">{insight.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {insight.description}
          </p>
        </div>
      ))}
    </div>
  );
}
