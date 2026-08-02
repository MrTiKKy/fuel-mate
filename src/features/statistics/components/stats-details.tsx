"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency, formatDistance, formatNumber } from "@/lib/formatters";
import { formatConsumptionValue, formatFuelDate } from "@/features/fuel/utils";
import type { StatisticsSnapshot } from "@/features/statistics/selectors";
import { cn } from "@/lib/utils";

type StatsDetailsProps = {
  snapshot: Pick<
    StatisticsSnapshot,
    | "fuelCostHistory"
    | "consumptionHistory"
    | "monthly"
    | "yearlyBreakdown"
  >;
};

export function StatsDetails({ snapshot }: StatsDetailsProps) {
  return (
    <div className="space-y-2">
      <Expandable title="Fuel cost history">
        {snapshot.fuelCostHistory.length === 0 ? (
          <EmptyRow />
        ) : (
          <ul className="space-y-2">
            {snapshot.fuelCostHistory.slice(0, 12).map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{formatFuelDate(row.date)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.station || "No station"} · {row.liters.toFixed(1)} L
                  </p>
                </div>
                <p className="shrink-0 font-medium">
                  {formatCurrency(row.totalCost)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Expandable>

      <Expandable title="Consumption history">
        {snapshot.consumptionHistory.length === 0 ? (
          <EmptyRow />
        ) : (
          <ul className="space-y-2">
            {snapshot.consumptionHistory.slice(0, 12).map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium">{formatFuelDate(row.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(row.distance)} · {row.liters.toFixed(1)} L
                  </p>
                </div>
                <p className="font-medium">
                  {formatConsumptionValue(row.consumption)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Expandable>

      <Expandable title="Monthly breakdown">
        {snapshot.monthly.length === 0 ? (
          <EmptyRow />
        ) : (
          <ul className="space-y-2">
            {[...snapshot.monthly].reverse().map((row) => (
              <li key={row.key} className="rounded-xl bg-muted/40 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(row.fuelCost)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistance(row.distance)} ·{" "}
                  {formatNumber(row.liters, "en-US", 1)} L · {row.stops} stops
                </p>
              </li>
            ))}
          </ul>
        )}
      </Expandable>

      <Expandable title="Yearly breakdown">
        {snapshot.yearlyBreakdown.length === 0 ? (
          <EmptyRow />
        ) : (
          <ul className="space-y-2">
            {[...snapshot.yearlyBreakdown].reverse().map((row) => (
              <li key={row.key} className="rounded-xl bg-muted/40 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(row.fuelCost)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistance(row.distance)} ·{" "}
                  {formatNumber(row.liters, "en-US", 1)} L · {row.stops} stops
                  {row.avgConsumption > 0
                    ? ` · ${row.avgConsumption.toFixed(2)} L/100km`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Expandable>
    </div>
  );
}

function Expandable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <button
        type="button"
        className="flex h-12 w-full items-center justify-between gap-3 px-4 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold tracking-tight">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="border-t border-border/60 px-4 py-3">{children}</div> : null}
    </div>
  );
}

function EmptyRow() {
  return <p className="text-sm text-muted-foreground">No data in this range.</p>;
}
