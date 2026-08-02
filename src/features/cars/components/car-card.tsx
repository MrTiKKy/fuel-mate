"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Fuel, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CarActionsMenu,
  type CarAction,
} from "@/features/cars/components/car-actions-menu";
import { useLongPress } from "@/features/cars/hooks/use-long-press";
import {
  formatConsumption,
  formatTankCapacity,
  getCarDisplayName,
  getFuelTypeLabel,
} from "@/features/cars/utils";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

type CarCardProps = {
  car: Car;
  isActive: boolean;
  onAction: (car: Car, action: CarAction) => void;
};

export function CarCard({ car, isActive, onAction }: CarCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const longPress = useLongPress({
    onLongPress: () => setMenuOpen(true),
    onClick: () => router.push(`/cars/${car.id}`),
  });

  return (
    <article
      className={cn(
        "group relative animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-200",
        "active:scale-[0.985] touch-manipulation select-none",
        isActive
          ? "border-primary/40 shadow-[0_0_0_1px_oklch(0.72_0.13_195_/_0.15)]"
          : "border-border/70 hover:border-primary/25",
      )}
      {...longPress}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/8 to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {car.brand}{" "}
              <span className="text-foreground/90">{car.model}</span>
            </h3>
            {isActive ? (
              <Badge className="rounded-lg bg-primary/15 text-primary hover:bg-primary/15">
                Active
              </Badge>
            ) : null}
          </div>
          {car.name && car.name !== `${car.brand} ${car.model}` ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {getCarDisplayName(car)}
            </p>
          ) : null}
          <p className="mt-2 font-mono text-sm tracking-wide text-muted-foreground uppercase">
            {car.licensePlate || "No plate"}
          </p>
        </div>

        <div className="pointer-events-auto shrink-0">
          <CarActionsMenu
            car={car}
            isActive={isActive}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onAction={(action) => onAction(car, action)}
          />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <Metric
          icon={Fuel}
          label="Fuel"
          value={getFuelTypeLabel(car.fuelType)}
        />
        <Metric
          icon={Gauge}
          label="Avg"
          value={formatConsumption(car.averageConsumption)}
        />
        <Metric
          icon={Droplets}
          label="Tank"
          value={formatTankCapacity(car.tankCapacity)}
        />
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/40 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3" strokeWidth={2} />
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-medium">{value}</p>
    </div>
  );
}
