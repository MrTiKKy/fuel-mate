"use client";

import Link from "next/link";
import {
  Calculator,
  Car,
  Droplets,
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
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { FuelCard } from "@/features/dashboard/components/fuel-card";
import { PullToRefresh } from "@/features/dashboard/components/pull-to-refresh";
import { QuickActionCard } from "@/features/dashboard/components/quick-action-card";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { VehicleCard } from "@/features/dashboard/components/vehicle-card";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
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
    isLoading,
    isRefreshing,
    refresh,
  } = useDashboard();

  const hasCars = cars.length > 0;
  const hasFuel = entryCount > 0;
  const hasServiceReminders = upcomingReminders.length > 0;

  return (
    <>
      <DashboardHeader activeCar={activeCar} />

      <PullToRefresh onRefresh={refresh} isRefreshing={isRefreshing}>
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
                    title="+ Fuel Calculator"
                    description="Fuel for distance"
                    href="/calculators/fuel"
                    icon={Calculator}
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
                          ? formatCurrency(overallStats.costPer100Km)
                          : "—"
                      }
                      hint="Average"
                      icon={Droplets}
                    />
                    <SummaryCard
                      label="Fuel cost"
                      value={formatCurrency(monthlyStats.totalFuelCost)}
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
                      value={formatCurrency(monthlyStats.totalFuelCost)}
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

              <section className="space-y-3">
                <SectionHeader
                  title="Upcoming service"
                  action={
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs"
                    >
                      <Link href="/service">See all</Link>
                    </Button>
                  }
                />
                {hasServiceReminders ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {upcomingReminders.map((item) => {
                      const parts: string[] = [];
                      if (item.daysRemaining !== null) {
                        parts.push(
                          item.daysRemaining < 0
                            ? `${Math.abs(item.daysRemaining)}d overdue`
                            : `${item.daysRemaining}d left`,
                        );
                      }
                      if (item.kmRemaining !== null) {
                        parts.push(
                          item.kmRemaining < 0
                            ? `${Math.abs(item.kmRemaining)} km overdue`
                            : `${item.kmRemaining} km left`,
                        );
                      }
                      return (
                        <Link
                          key={item.id}
                          href={`/service/${item.recordId}`}
                          className="rounded-2xl border border-border/70 bg-card px-4 py-3.5 transition-colors hover:border-primary/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{item.title}</p>
                            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {parts.join(" · ") || "Reminder set"}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Wrench}
                    title="No service reminders"
                    description="Oil change, ITP, insurance, and tyres will show here once you add them."
                    action={
                      <Button asChild variant="secondary" className="h-11 rounded-xl px-5">
                        <Link href="/service">Open Service</Link>
                      </Button>
                    }
                  />
                )}
              </section>

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
