"use client";

import Link from "next/link";
import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import {
  FeaturedInsight,
} from "@/features/insights/components/insight-card";
import type { Insight, InsightsUnlockStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

type InsightsDashboardSectionProps = {
  unlock: InsightsUnlockStatus;
  featured: Insight | null;
  isLoading?: boolean;
};

export function InsightsDashboardSection({
  unlock,
  featured,
  isLoading,
}: InsightsDashboardSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Insights"
        action={
          unlock.unlocked ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-2 text-xs"
            >
              <Link href="/insights">View all</Link>
            </Button>
          ) : null
        }
      />

      {isLoading ? <Skeleton className="h-36 rounded-3xl" /> : null}

      {!isLoading && !unlock.unlocked ? (
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-primary/10 via-card/90 to-card/90 p-1">
          <div className="rounded-[1.35rem] bg-card/60 px-4 py-8 text-center backdrop-blur-md">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold tracking-tight">
              Keep using Garage+ to unlock personalized insights.
            </p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Available after 3 months of history, or 10 fuel entries / expenses —
              calculated locally on your device.
            </p>
            <Button
              asChild
              variant="secondary"
              className="mt-5 h-10 rounded-2xl"
            >
              <Link href="/insights">Learn more</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && unlock.unlocked ? (
        featured ? (
          <FeaturedInsight insight={featured} />
        ) : (
          <div className="rounded-3xl border border-border/60 bg-card/80 px-4 py-8 text-center">
            <Lightbulb className="mx-auto size-6 text-primary" />
            <p className="mt-3 text-sm font-medium">No insights right now</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep logging activity — we&apos;ll surface patterns when they appear.
            </p>
            <Button asChild variant="secondary" className="mt-4 h-10 rounded-2xl">
              <Link href="/insights">View All Insights</Link>
            </Button>
          </div>
        )
      ) : null}
    </section>
  );
}
