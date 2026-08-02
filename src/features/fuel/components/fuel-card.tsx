"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Gauge, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import type { FuelEntry } from "@/types";

type FuelCardProps = {
  entry: FuelEntry;
  onAction: (entry: FuelEntry, action: FuelAction) => void;
};

const SWIPE_THRESHOLD = 56;

export function FuelCard({ entry, onAction }: FuelCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const startX = useRef(0);
  const swiping = useRef(false);

  const longPress = useLongPress({
    onLongPress: () => setMenuOpen(true),
    onClick: () => {
      if (revealed) {
        setRevealed(false);
        return;
      }
      router.push(`/fuel/${entry.id}`);
    },
  });

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex w-[140px] items-stretch">
        <button
          type="button"
          className="flex flex-1 items-center justify-center bg-secondary text-xs font-semibold text-secondary-foreground"
          onClick={() => {
            setRevealed(false);
            onAction(entry, "edit");
          }}
        >
          Edit
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center bg-destructive text-xs font-semibold text-white"
          onClick={() => {
            setRevealed(false);
            onAction(entry, "delete");
          }}
        >
          Delete
        </button>
      </div>

      <article
        className={cn(
          "relative animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)] rounded-2xl border border-border/70 bg-card p-4 transition-transform duration-200",
          "touch-manipulation select-none active:scale-[0.99]",
          revealed && "-translate-x-[140px] rounded-l-2xl rounded-r-none",
        )}
        {...longPress}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
          swiping.current = false;
          longPress.onPointerDown();
        }}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - startX.current;
          if (Math.abs(dx) > 12) {
            swiping.current = true;
            longPress.onPointerCancel();
          }
        }}
        onTouchEnd={(e) => {
          longPress.onPointerUp();
          if (!swiping.current) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (dx < -SWIPE_THRESHOLD) setRevealed(true);
          else if (dx > SWIPE_THRESHOLD) setRevealed(false);
        }}
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
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">
                {entry.fuelStation || "No station"}
              </span>
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
          <Metric label="Odometer" value={formatDistance(entry.odometer)} />
          <Metric label="Liters" value={formatLiters(entry.liters)} />
          <Metric label="Total" value={formatCurrency(entry.totalCost)} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Droplets className="size-3.5" />
            {formatCurrency(entry.pricePerLiter)}/L ·{" "}
            {getFuelTypeLabel(entry.fuelType)}
          </span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Gauge className="size-3.5 text-primary" />
            {formatConsumptionValue(entry.consumption)}
          </span>
        </div>
      </article>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-2.5 py-2">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium">{value}</p>
    </div>
  );
}
