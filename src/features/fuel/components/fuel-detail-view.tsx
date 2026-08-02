"use client";

import {
  Calendar,
  Droplets,
  Fuel,
  Gauge,
  NotebookPen,
  Route,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/shared/section";
import { StatCard } from "@/components/shared/stat-card";
import { useCurrency } from "@/components/providers/app-settings-provider";
import {
  formatConsumptionValue,
  formatFuelDate,
  formatLiters,
  getFuelTypeLabel,
} from "@/features/fuel/utils";
import { formatCurrency, formatDistance } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Car, FuelEntry } from "@/types";
import { getCarDisplayName } from "@/features/cars/utils";

type FuelDetailViewProps = {
  entry: FuelEntry;
  car?: Car | null;
};

export function FuelDetailView({ entry, car }: FuelDetailViewProps) {
  const currency = useCurrency();

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-5">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {formatFuelDate(entry.date)}
            </h2>
            {entry.isFullTank ? (
              <Badge className="rounded-lg bg-primary/15 text-primary hover:bg-primary/15">
                Full tank
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-lg">
                Partial
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {car ? getCarDisplayName(car) : "Unknown vehicle"} ·{" "}
            {getFuelTypeLabel(entry.fuelType)}
          </p>
        </div>
      </div>

      <Section title="Snapshot">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total cost"
            value={formatCurrency(entry.totalCost, currency)}
            icon={Droplets}
          />
          <StatCard
            label="Fuel amount"
            value={formatLiters(entry.liters)}
            icon={Fuel}
          />
          <StatCard
            label="Distance"
            value={formatDistance(entry.distanceSinceLastRefuel || 0)}
            icon={Route}
          />
          <StatCard
            label="Consumption"
            value={formatConsumptionValue(entry.consumption)}
            icon={Gauge}
            hint={entry.isFullTank ? "From this fill-up" : "Full tank required"}
          />
        </div>
      </Section>

      <DetailSection title="Costs">
        <DetailRow
          icon={Droplets}
          label="Price / L"
          value={formatCurrency(entry.pricePerLiter, currency)}
        />
        <Separator />
        <DetailRow
          icon={Route}
          label="Cost / km"
          value={
            entry.costPerKm != null
              ? formatCurrency(entry.costPerKm, currency)
              : "—"
          }
        />
        <Separator />
        <DetailRow
          icon={Gauge}
          label="Cost / 100 km"
          value={
            entry.costPer100Km != null
              ? formatCurrency(entry.costPer100Km, currency)
              : "—"
          }
        />
        <Separator />
        <DetailRow
          icon={Calendar}
          label="Date"
          value={formatFuelDate(entry.date)}
        />
      </DetailSection>

      <DetailSection title="Notes">
        <p
          className={cn(
            "flex gap-3 px-4 py-4 text-sm leading-relaxed",
            entry.notes ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {entry.notes || "No notes."}
        </p>
      </DetailSection>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/90">
      <h3 className="border-b border-border/50 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
