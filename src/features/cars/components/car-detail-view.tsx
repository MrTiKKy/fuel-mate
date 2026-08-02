"use client";

import {
  Calendar,
  Droplets,
  Fuel,
  Gauge,
  Hash,
  Palette,
  Route,
  Settings2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/stat-card";
import { Section } from "@/components/shared/section";
import { EMPTY_CAR_STATS } from "@/features/cars/constants";
import {
  formatConsumption,
  formatHorsepower,
  formatTankCapacity,
  getCarDisplayName,
  getFuelTypeLabel,
  getTransmissionLabel,
} from "@/features/cars/utils";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

type CarDetailViewProps = {
  car: Car;
  isActive: boolean;
};

export function CarDetailView({ car, isActive }: CarDetailViewProps) {
  const stats = {
    ...EMPTY_CAR_STATS,
    averageConsumption: car.averageConsumption ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {car.brand} {car.model}
            </h2>
            {isActive ? (
              <Badge className="rounded-lg bg-primary/15 text-primary hover:bg-primary/15">
                Active
              </Badge>
            ) : null}
          </div>
          {car.name !== `${car.brand} ${car.model}` ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {getCarDisplayName(car)}
            </p>
          ) : null}
          <p className="mt-3 font-mono text-sm tracking-widest text-muted-foreground uppercase">
            {car.licensePlate || "No license plate"}
          </p>
        </div>
      </div>

      <Section title="Statistics" description="Per-vehicle totals">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Fuel entries"
            value={formatNumber(stats.totalFuelEntries, "en-US", 0)}
            icon={Fuel}
            hint="Placeholder"
          />
          <StatCard
            label="Distance"
            value={`${formatNumber(stats.totalDistance, "en-US", 0)} km`}
            icon={Route}
            hint="Placeholder"
          />
          <StatCard
            label="Fuel cost"
            value={formatCurrency(stats.totalFuelCost)}
            icon={Droplets}
            hint="Placeholder"
          />
          <StatCard
            label="Avg. consumption"
            value={
              stats.averageConsumption > 0
                ? formatConsumption(stats.averageConsumption)
                : "—"
            }
            icon={Gauge}
            hint="From profile"
          />
        </div>
      </Section>

      <DetailSection title="General">
        <DetailRow icon={Hash} label="Brand" value={car.brand} />
        <Separator />
        <DetailRow icon={Hash} label="Model" value={car.model} />
        <Separator />
        <DetailRow
          icon={Calendar}
          label="Year"
          value={car.year?.toString() ?? "—"}
        />
        <Separator />
        <DetailRow
          icon={Palette}
          label="Color"
          value={car.color ?? "—"}
        />
        <Separator />
        <DetailRow
          icon={Calendar}
          label="Purchase date"
          value={
            car.purchaseDate
              ? new Date(car.purchaseDate).toLocaleDateString()
              : "—"
          }
        />
      </DetailSection>

      <DetailSection title="Engine">
        <DetailRow
          icon={Settings2}
          label="Engine"
          value={car.engine ?? "—"}
        />
        <Separator />
        <DetailRow
          icon={Settings2}
          label="Transmission"
          value={getTransmissionLabel(car.transmission) ?? "—"}
        />
        <Separator />
        <DetailRow
          icon={Zap}
          label="Horsepower"
          value={formatHorsepower(car.horsepower)}
        />
      </DetailSection>

      <DetailSection title="Fuel">
        <DetailRow
          icon={Fuel}
          label="Fuel type"
          value={getFuelTypeLabel(car.fuelType)}
        />
        <Separator />
        <DetailRow
          icon={Droplets}
          label="Tank capacity"
          value={formatTankCapacity(car.tankCapacity)}
        />
        <Separator />
        <DetailRow
          icon={Gauge}
          label="Average consumption"
          value={formatConsumption(car.averageConsumption)}
        />
      </DetailSection>

      <DetailSection title="Notes">
        <p
          className={cn(
            "px-4 py-4 text-sm leading-relaxed",
            car.notes ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {car.notes || "No notes yet."}
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
