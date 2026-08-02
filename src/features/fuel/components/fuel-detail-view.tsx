"use client";

import {
  Calendar,
  Droplets,
  Fuel,
  Gauge,
  MapPin,
  NotebookPen,
  Route,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/shared/section";
import { StatCard } from "@/components/shared/stat-card";
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
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5">
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
            {car ? getCarDisplayName(car) : "Unknown vehicle"}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {entry.fuelStation || "No station recorded"}
          </p>
        </div>
      </div>

      <Section title="Snapshot">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total cost"
            value={formatCurrency(entry.totalCost)}
            icon={Droplets}
          />
          <StatCard
            label="Liters"
            value={formatLiters(entry.liters)}
            icon={Fuel}
          />
          <StatCard
            label="Consumption"
            value={formatConsumptionValue(entry.consumption)}
            icon={Gauge}
            hint={entry.consumption ? "Full-to-full" : "Needs full tanks"}
          />
          <StatCard
            label="Odometer"
            value={formatDistance(entry.odometer)}
            icon={Route}
          />
        </div>
      </Section>

      <DetailSection title="General">
        <DetailRow
          icon={Calendar}
          label="Date"
          value={formatFuelDate(entry.date)}
        />
        <Separator />
        <DetailRow
          icon={MapPin}
          label="Station"
          value={entry.fuelStation || "—"}
        />
        <Separator />
        <DetailRow
          icon={Fuel}
          label="Fuel type"
          value={getFuelTypeLabel(entry.fuelType)}
        />
        <Separator />
        <DetailRow
          icon={Route}
          label="Odometer"
          value={formatDistance(entry.odometer)}
        />
      </DetailSection>

      <DetailSection title="Costs">
        <DetailRow
          icon={Droplets}
          label="Price / L"
          value={formatCurrency(entry.pricePerLiter)}
        />
        <Separator />
        <DetailRow
          icon={Fuel}
          label="Liters"
          value={formatLiters(entry.liters)}
        />
        <Separator />
        <DetailRow
          icon={Droplets}
          label="Total cost"
          value={formatCurrency(entry.totalCost)}
        />
      </DetailSection>

      <DetailSection title="Consumption">
        <DetailRow
          icon={Gauge}
          label="Calculated"
          value={formatConsumptionValue(entry.consumption)}
        />
        <Separator />
        <DetailRow
          icon={Fuel}
          label="Full tank"
          value={entry.isFullTank ? "Yes" : "No"}
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
    <Section title={title}>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {children}
      </div>
    </Section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
