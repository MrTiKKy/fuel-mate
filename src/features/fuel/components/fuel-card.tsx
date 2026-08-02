"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Gauge, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SwipeableRow } from "@/components/shared/swipeable-row";
import { useCurrency } from "@/components/providers/app-settings-provider";
import {
  FuelActionsMenu,
  type FuelAction,
} from "@/features/fuel/components/fuel-actions-menu";
import { useLongPress } from "@/features/cars/hooks/use-long-press";
import {
  formatConsumptionValue,
  formatFuelDate,
  formatLiters,
  getFuelTypeLabel,
} from "@/features/fuel/utils";
import { formatCurrency, formatDistance } from "@/lib/formatters";
import type { FuelEntry } from "@/types";

type FuelCardProps = {
  entry: FuelEntry;
  onAction: (entry: FuelEntry, action: FuelAction) => void;
};

export function FuelCard({ entry, onAction }: FuelCardProps) {
  const router = useRouter();
  const currency = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const longPress = useLongPress({
    onLongPress: () => setMenuOpen(true),
    onClick: () => router.push(`/fuel/${entry.id}`),
  });

  return (
    <SwipeableRow
      onAction={(action) => onAction(entry, action)}
      className="animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]"
    >
      <article
        className="rounded-3xl border border-border/60 bg-card/90 p-4 backdrop-blur-md active:scale-[0.99]"
        {...longPress}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                {formatFuelDate(entry.date)}
              </h3>
              {entry.isFullTank ? (
                <Badge variant="secondary" className="rounded-lg text-[10px]">
                  Full tank
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {getFuelTypeLabel(entry.fuelType)} ·{" "}
              {formatCurrency(entry.pricePerLiter, currency)}/L
            </p>
          </div>
          <div className="pointer-events-auto shrink-0">
            <FuelActionsMenu
              entry={entry}
              open={menuOpen}
              onOpenChange={setMenuOpen}
              onAction={(action) => onAction(entry, action)}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric
            label="Distance"
            value={formatDistance(entry.distanceSinceLastRefuel || 0)}
          />
          <Metric label="Fuel" value={formatLiters(entry.liters)} />
          <Metric
            label="Total"
            value={formatCurrency(entry.totalCost, currency)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Route className="size-3.5" />
            {entry.costPerKm != null
              ? `${formatCurrency(entry.costPerKm, currency)}/km`
              : "—"}
          </span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Gauge className="size-3.5 text-primary" />
            {formatConsumptionValue(entry.consumption)}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="size-3.5" />
            {entry.costPer100Km != null
              ? `${formatCurrency(entry.costPer100Km, currency)}/100`
              : "—"}
          </span>
        </div>
      </article>
    </SwipeableRow>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-2.5 py-2">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium">{value}</p>
    </div>
  );
}
