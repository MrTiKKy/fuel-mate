import Link from "next/link";
import { Droplets, Gauge, MapPin, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatConsumptionValue,
  formatFuelDate,
  formatLiters,
  getFuelTypeLabel,
} from "@/features/fuel/utils";
import { formatCurrency, formatDistance } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { FuelEntry } from "@/types";

type FuelCardProps = {
  entry: FuelEntry;
  className?: string;
};

/** Dashboard last-fuel-entry card (not the fuel list card). */
export function FuelCard({ entry, className }: FuelCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/8 to-transparent" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Last fill-up
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight">
            {formatFuelDate(entry.date)}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {entry.fuelStation || "No station"}
          </p>
        </div>
        {entry.isFullTank ? (
          <Badge className="rounded-lg bg-primary/15 text-primary hover:bg-primary/15">
            Full tank
          </Badge>
        ) : null}
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="Liters" value={formatLiters(entry.liters)} />
        <Metric
          label="Price / L"
          value={formatCurrency(entry.pricePerLiter)}
        />
        <Metric label="Total" value={formatCurrency(entry.totalCost)} />
        <Metric label="Odometer" value={formatDistance(entry.odometer)} icon={Route} />
        <Metric
          label="Consumption"
          value={formatConsumptionValue(entry.consumption)}
          icon={Gauge}
        />
        <Metric
          label="Fuel"
          value={getFuelTypeLabel(entry.fuelType)}
          icon={Droplets}
        />
      </div>

      <Button asChild className="mt-5 h-11 w-full rounded-xl">
        <Link href={`/fuel/${entry.id}`}>View Details</Link>
      </Button>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3" strokeWidth={2} /> : null}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
