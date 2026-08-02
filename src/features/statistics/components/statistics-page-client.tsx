"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BarChart3,
  Droplets,
  Fuel,
  Gauge,
  Route,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { InsightsList } from "@/features/statistics/components/insights-list";
import { StatsDetails } from "@/features/statistics/components/stats-details";
import { StatsExportBar } from "@/features/statistics/components/stats-export-bar";
import { StatsFiltersBar } from "@/features/statistics/components/stats-filters-bar";
import { StatsSkeleton } from "@/features/statistics/components/stats-skeleton";
import { StatsSummaryCard } from "@/features/statistics/components/stats-summary-card";
import { VehicleComparisonGrid } from "@/features/statistics/components/vehicle-comparison-grid";
import { useStatistics } from "@/features/statistics/hooks/use-statistics";
import { formatCurrency, formatDistance, formatNumber } from "@/lib/formatters";

const StatsCharts = dynamic(
  () =>
    import("@/features/statistics/components/stats-charts").then(
      (mod) => mod.StatsCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
      </div>
    ),
  },
);

export function StatisticsPageClient() {
  const {
    cars,
    filters,
    updateFilters,
    isLoading,
    summary,
    monthly,
    consumptionTrend,
    costByVehicle,
    comparisons,
    insights,
    fuelCostHistory,
    consumptionHistory,
    yearlyBreakdown,
    filteredEntries,
    entries,
  } = useStatistics();

  const hasAnyFuel = entries.length > 0;
  const hasFilteredFuel = filteredEntries.length > 0;

  return (
    <>
      <AppHeader
        title="Statistics"
        subtitle={
          isLoading
            ? "Loading analytics…"
            : hasFilteredFuel
              ? `${summary.stops} stop${summary.stops === 1 ? "" : "s"} in range`
              : "Insights from your driving data"
        }
      />

      <PageContainer className="space-y-7 pb-10">
        {isLoading ? <StatsSkeleton /> : null}

        {!isLoading && !hasAnyFuel ? (
          <EmptyState
            icon={BarChart3}
            title="No statistics yet."
            description="Record your first fuel stop to unlock charts, insights, and trends."
            action={
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/fuel">Add Fuel Entry</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && hasAnyFuel ? (
          <>
            <StatsFiltersBar
              cars={cars}
              filters={filters}
              onChange={updateFilters}
            />

            {!hasFilteredFuel ? (
              <EmptyState
                icon={BarChart3}
                title="No data in this range"
                description="Try another vehicle or period to see statistics."
              />
            ) : (
              <>
                <section className="space-y-3">
                  <SectionHeader
                    title="Overview"
                    description="Calculated from your local fuel log"
                  />
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    <StatsSummaryCard
                      label="Avg. consumption"
                      value={summary.averageConsumption}
                      format={(v) =>
                        v > 0 ? `${v.toFixed(2)}` : "—"
                      }
                      hint="L/100km"
                      icon={Gauge}
                    />
                    <StatsSummaryCard
                      label="Cost / 100 km"
                      value={summary.costPer100Km}
                      format={(v) => (v > 0 ? formatCurrency(v) : "—")}
                      icon={Droplets}
                    />
                    <StatsSummaryCard
                      label="Cost / km"
                      value={summary.costPerKm}
                      format={(v) => (v > 0 ? formatCurrency(v) : "—")}
                    />
                    <StatsSummaryCard
                      label="Total fuel cost"
                      value={summary.totalFuelCost}
                      format={(v) => formatCurrency(v)}
                      icon={Fuel}
                    />
                    <StatsSummaryCard
                      label="Total liters"
                      value={summary.totalLiters}
                      format={(v) => `${formatNumber(v, "en-US", 1)} L`}
                    />
                    <StatsSummaryCard
                      label="Total distance"
                      value={summary.distanceTravelled}
                      format={(v) => formatDistance(v)}
                      icon={Route}
                    />
                    <StatsSummaryCard
                      label="Fuel stops"
                      value={summary.stops}
                      format={(v) => formatNumber(v, "en-US", 0)}
                      className="col-span-2 md:col-span-1"
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <SectionHeader title="Charts" />
                  <StatsCharts
                    monthly={monthly}
                    consumptionTrend={consumptionTrend}
                    costByVehicle={costByVehicle}
                  />
                </section>

                {insights.length > 0 ? (
                  <section className="space-y-3">
                    <SectionHeader title="Insights" />
                    <InsightsList insights={insights} />
                  </section>
                ) : null}

                {comparisons.length > 1 ? (
                  <section className="space-y-3">
                    <SectionHeader title="Vehicle comparison" />
                    <VehicleComparisonGrid comparisons={comparisons} />
                  </section>
                ) : null}

                <section className="space-y-3">
                  <SectionHeader title="Details" />
                  <StatsDetails
                    snapshot={{
                      fuelCostHistory,
                      consumptionHistory,
                      monthly,
                      yearlyBreakdown,
                    }}
                  />
                </section>

                <StatsExportBar
                  snapshot={{
                    filters,
                    filteredEntries,
                    summary,
                    monthly,
                    consumptionTrend,
                    costByVehicle,
                    comparisons,
                    insights,
                    fuelCostHistory,
                    consumptionHistory,
                    yearlyBreakdown,
                  }}
                  entries={filteredEntries}
                />
              </>
            )}
          </>
        ) : null}
      </PageContainer>
    </>
  );
}
