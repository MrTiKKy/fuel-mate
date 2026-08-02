"use client";

import Link from "next/link";
import {
  Car,
  Droplets,
  FileText,
  Fuel,
  Gauge,
  Route,
  Wrench,
} from "lucide-react";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/features/dashboard/components/activity-card";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DocumentsDashboardSection } from "@/features/dashboard/components/documents-dashboard-section";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { FuelCard } from "@/features/dashboard/components/fuel-card";
import { InsightsDashboardSection } from "@/features/dashboard/components/insights-dashboard-section";
import { PullToRefresh } from "@/features/dashboard/components/pull-to-refresh";
import { QuickActionCard } from "@/features/dashboard/components/quick-action-card";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { VehicleCard } from "@/features/dashboard/components/vehicle-card";
import { ReminderBoard } from "@/features/dashboard/components/reminder-board";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useInsights } from "@/features/insights/hooks/use-insights";
import { useCurrency } from "@/components/providers/app-settings-provider";
import { formatCurrency, formatDistance, formatNumber } from "@/lib/formatters";

export function DashboardPageClient() {
  const {
    activeCar,
    cars,
    lastFuelEntry,
    overallStats,
    monthlyStats,
    entryCount,
    activities,
    upcomingReminders,
    documentReminders,
    missingDocumentTypes,
    isLoading,
    isRefreshing,
    refresh,
  } = useDashboard();
  const {
    unlock,
    featured,
    isLoading: insightsLoading,
    refresh: refreshInsights,
  } = useInsights();
  const currency = useCurrency();

  const hasCars = cars.length > 0;
  const hasFuel = entryCount > 0;

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshInsights()]);
  };

  return (
    <>
      <DashboardHeader activeCar={activeCar} />

      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <PageContainer className="space-y-7 pb-8">
          {isLoading ? <DashboardSkeleton /> : null}

          {!isLoading && !hasCars ? (
            <EmptyState
              icon={Car}
              title="Add your first vehicle to begin."
              description="Your dashboard comes alive once a car is in the garage — fuel, costs, and trips all in one place."
              action={
                <Button asChild className="h-11 rounded-xl px-5">
                  <Link href="/cars">Add Vehicle</Link>
                </Button>
              }
            />
          ) : null}

          {!isLoading && hasCars ? (
            <>
              <section className="space-y-3">
                <SectionHeader title="Quick actions" />
                <div className="grid grid-cols-2 gap-3">
                  <QuickActionCard
                    title="+ Fuel Entry"
                    description="Log a fill-up"
                    href="/fuel"
                    icon={Fuel}
                  />
                  <QuickActionCard
                    title="+ Trip Calculator"
                    description="Estimate a trip"
                    href="/calculators/trip"
                    icon={Route}
                  />
                  <QuickActionCard
                    title="+ Document"
                    description="Insurance & more"
                    href="/documents"
                    icon={FileText}
                  />
                  <QuickActionCard
                    title="+ Service"
                    description="Maintenance"
                    href="/service"
                    icon={Wrench}
                  />
                </div>
              </section>

              {!hasFuel ? (
                <EmptyState
                  icon={Fuel}
                  title="Record your first fuel stop."
                  description="Add a fill-up to unlock consumption, monthly spend, and activity on your home screen."
                  action={
                    <Button asChild className="h-11 rounded-xl px-5">
                      <Link href="/fuel">Add Fuel Entry</Link>
                    </Button>
                  }
                />
              ) : (
                <section className="space-y-3">
                  <SectionHeader
                    title="Summary"
                    description="Live from your fuel log"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <SummaryCard
                      label="Avg. consumption"
                      value={
                        overallStats.averageConsumption > 0
                          ? `${overallStats.averageConsumption.toFixed(2)}`
                          : "—"
                      }
                      hint="L/100km"
                      icon={Gauge}
                    />
                    <SummaryCard
                      label="Cost / 100 km"
                      value={
                        overallStats.costPer100Km > 0
                          ? formatCurrency(overallStats.costPer100Km, currency)
                          : "—"
                      }
                      hint="Average"
                      icon={Droplets}
                    />
                    <SummaryCard
                      label="Fuel cost"
                      value={formatCurrency(monthlyStats.totalFuelCost, currency)}
                      hint="This month"
                      icon={Fuel}
                    />
                    <SummaryCard
                      label="Distance"
                      value={formatDistance(monthlyStats.distanceTravelled)}
                      hint="This month"
                      icon={Route}
                    />
                    <SummaryCard
                      label="Fuel entries"
                      value={formatNumber(entryCount, "en-US", 0)}
                      hint="This vehicle"
                      className="col-span-2 sm:col-span-1"
                    />
                  </div>
                </section>
              )}

              {lastFuelEntry ? (
                <section className="space-y-3">
                  <SectionHeader title="Last fuel entry" />
                  <FuelCard entry={lastFuelEntry} />
                </section>
              ) : null}

              {activeCar ? (
                <section className="space-y-3">
                  <SectionHeader title="Current vehicle" />
                  <VehicleCard car={activeCar} />
                </section>
              ) : null}

              {hasFuel ? (
                <section className="space-y-3">
                  <SectionHeader
                    title="Monthly overview"
                    description="Current month only"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <SummaryCard
                      label="Fuel cost"
                      value={formatCurrency(monthlyStats.totalFuelCost, currency)}
                    />
                    <SummaryCard
                      label="Distance"
                      value={formatDistance(monthlyStats.distanceTravelled)}
                    />
                    <SummaryCard
                      label="Liters"
                      value={`${formatNumber(monthlyStats.totalLiters, "en-US", 1)} L`}
                    />
                    <SummaryCard
                      label="Avg. consumption"
                      value={
                        monthlyStats.averageConsumption > 0
                          ? `${monthlyStats.averageConsumption.toFixed(2)} L/100km`
                          : "—"
                      }
                    />
                  </div>
                </section>
              ) : null}

              <ReminderBoard reminders={upcomingReminders} />

              <DocumentsDashboardSection
                reminders={documentReminders}
                missingTypes={missingDocumentTypes}
              />

              <InsightsDashboardSection
                unlock={unlock}
                featured={featured}
                isLoading={insightsLoading}
              />

              <section className="space-y-3">
                <SectionHeader title="Recent activity" />
                {activities.length === 0 ? (
                  <EmptyState
                    icon={Fuel}
                    title="No activity yet"
                    description="Fuel stops and garage changes will appear here."
                  />
                ) : (
                  <div className="space-y-2">
                    {activities.map((item) => (
                      <ActivityCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </PageContainer>
      </PullToRefresh>
    </>
  );
}
