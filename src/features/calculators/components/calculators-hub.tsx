"use client";

import { Calculator, Star } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { FeatureCard } from "@/components/shared/feature-card";
import { GlassCard } from "@/components/shared/glass-card";
import { MotionItem, MotionList } from "@/components/shared/motion";
import { PageContainer } from "@/components/shared/page-container";
import {
  CALCULATORS,
  CALCULATORS_HUB_HINT,
} from "@/features/calculators/constants";

export function CalculatorsHub() {
  return (
    <>
      <AppHeader
        title="Calculators"
        subtitle="Estimate costs before you drive"
      />
      <PageContainer className="space-y-4">
        <FeatureCard
          title="Saved calculations"
          description="Named trips and estimates — reopen anytime"
          href="/calculators/saved"
          icon={Star}
        />

        <MotionList className="grid gap-3">
          {CALCULATORS.map((item) => (
            <MotionItem key={item.id}>
              <FeatureCard
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
              />
            </MotionItem>
          ))}
        </MotionList>

        <GlassCard className="flex items-center gap-3 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Calculator className="size-4" strokeWidth={1.75} />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {CALCULATORS_HUB_HINT} Tap ⭐ on results to save them.
          </p>
        </GlassCard>
      </PageContainer>
    </>
  );
}
