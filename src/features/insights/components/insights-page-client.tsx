"use client";

import { Lightbulb } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InsightCard,
  InsightsLockedState,
} from "@/features/insights/components/insight-card";
import { useInsights } from "@/features/insights/hooks/use-insights";
import { MotionList, MotionItem } from "@/components/shared/motion";

export function InsightsPageClient() {
  const { unlock, insights, isLoading } = useInsights();

  return (
    <>
      <AppHeader
        title="Insights"
        subtitle="Local recommendations from your garage"
      />
      <PageContainer className="space-y-5 pb-10">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-3xl" />
            ))}
          </div>
        ) : null}

        {!isLoading && !unlock.unlocked ? <InsightsLockedState /> : null}

        {!isLoading && unlock.unlocked && insights.length === 0 ? (
          <div className="rounded-3xl border border-border/60 bg-card/80 px-5 py-12 text-center">
            <Lightbulb className="mx-auto size-7 text-primary" />
            <p className="mt-3 text-sm font-semibold">Looking good</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No notable patterns right now. Check back as you add more data.
            </p>
          </div>
        ) : null}

        {!isLoading && unlock.unlocked && insights.length > 0 ? (
          <MotionList className="space-y-3">
            {insights.map((insight) => (
              <MotionItem key={insight.id}>
                <InsightCard insight={insight} />
              </MotionItem>
            ))}
          </MotionList>
        ) : null}
      </PageContainer>
    </>
  );
}
