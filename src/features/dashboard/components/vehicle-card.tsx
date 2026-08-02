import Link from "next/link";
import { Car as CarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatConsumption,
  formatTankCapacity,
  getCarDisplayName,
  getFuelTypeLabel,
} from "@/features/cars/utils";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

type VehicleCardProps = {
  car: Car;
  className?: string;
};

export function VehicleCard({ car, className }: VehicleCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CarIcon className="size-5" strokeWidth={1.75} />
            </div>
            <Badge className="rounded-lg bg-primary/15 text-primary hover:bg-primary/15">
              Active
            </Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">
            {car.brand} {car.model}
          </h3>
          {car.name !== `${car.brand} ${car.model}` ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {getCarDisplayName(car)}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="relative mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label="Fuel type" value={getFuelTypeLabel(car.fuelType)} />
        <Info
          label="Avg. consumption"
          value={formatConsumption(car.averageConsumption)}
        />
        <Info
          label="Tank capacity"
          value={formatTankCapacity(car.tankCapacity)}
        />
        <Info
          label="License plate"
          value={car.licensePlate?.toUpperCase() || "—"}
        />
      </dl>

      <Button
        asChild
        variant="secondary"
        className="mt-5 h-11 w-full rounded-xl"
      >
        <Link href="/cars">Manage Cars</Link>
      </Button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2.5">
      <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 truncate font-medium">{value}</dd>
    </div>
  );
}
