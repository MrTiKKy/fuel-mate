"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/features/statistics/components/animated-number";
import { cn } from "@/lib/utils";

type StatsSummaryCardProps = {
  label: string;
  value: number;
  format: (value: number) => string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatsSummaryCard({
  label,
  value,
  format,
  hint,
  icon: Icon,
  className,
}: StatsSummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" strokeWidth={1.75} />
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight">
        <AnimatedNumber value={value} format={format} />
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
