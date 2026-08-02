"use client";

import {
  Calculator,
  FileText,
  HardDrive,
  Lightbulb,
  Settings,
  Wrench,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { FeatureCard } from "@/components/shared/feature-card";
import { PageContainer } from "@/components/shared/page-container";
import { Section } from "@/components/shared/section";

export function MorePageClient() {
  return (
    <>
      <AppHeader title="More" subtitle="Tools, service & preferences" />
      <PageContainer className="space-y-6">
        <Section title="Garage">
          <div className="grid gap-3">
            <FeatureCard
              title="Documents"
              description="Insurance, ITP, licenses, and invoices"
              href="/documents"
              icon={FileText}
            />
            <FeatureCard
              title="Insights"
              description="Personalized recommendations from your data"
              href="/insights"
              icon={Lightbulb}
            />
            <FeatureCard
              title="Service tracker"
              description="Maintenance history and reminders"
              href="/service"
              icon={Wrench}
            />
          </div>
        </Section>
        <Section title="Tools">
          <div className="grid gap-3">
            <FeatureCard
              title="Calculators"
              description="Fuel, trip, ownership, and tank tools"
              href="/calculators"
              icon={Calculator}
            />
          </div>
        </Section>
        <Section title="App">
          <div className="grid gap-3">
            <FeatureCard
              title="Settings"
              description="Units, currency, and appearance"
              href="/settings"
              icon={Settings}
            />
            <FeatureCard
              title="Backup & restore"
              description="Export or import your local data"
              href="/settings#backup"
              icon={HardDrive}
            />
          </div>
        </Section>
      </PageContainer>
    </>
  );
}
