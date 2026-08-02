"use client";

import Link from "next/link";
import { Lightbulb, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Insight } from "@/types";

export function InsightCard({
  insight,
  featured = false,
}: {
  insight: Insight;
  featured?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl border border-border/60 bg-card/90 p-4 backdrop-blur-md",
        featured && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-lg capitalize">
          {insight.category.replace("_", " ")}
        </Badge>
        <Badge
          className={cn(
            "rounded-lg capitalize hover:bg-inherit",
            insight.severity === "positive" && "bg-success/15 text-success",
            insight.severity === "warning" && "bg-warning/20 text-warning",
            insight.severity === "critical" &&
              "bg-destructive/15 text-destructive",
            insight.severity === "info" && "bg-primary/15 text-primary",
          )}
        >
          {insight.severity}
        </Badge>
      </div>
      <h3 className="mt-3 text-sm font-semibold tracking-tight leading-snug">
        {insight.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {insight.description}
      </p>
    </motion.article>
  );
}

export function InsightsLockedState() {
  return (
    <EmptyState
      icon={Sparkles}
      title="Keep using Garage+ to unlock personalized insights."
      description="Insights appear after about 3 months of history, or 10 fuel entries / expenses — all calculated on your device."
      suggestion="No AI. Pure local math from your garage data."
    />
  );
}

export function FeaturedInsight({
  insight,
}: {
  insight: Insight | null;
  lockedReason?: string;
}) {
  if (!insight) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/50 px-4 py-8 text-center">
        <Lightbulb className="mx-auto size-6 text-primary" />
        <p className="mt-3 text-sm font-medium">No insights yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Keep logging fuel, service, and documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <InsightCard insight={insight} featured />
      <Button asChild variant="secondary" className="h-11 w-full rounded-2xl">
        <Link href="/insights">View All Insights</Link>
      </Button>
    </div>
  );
}
