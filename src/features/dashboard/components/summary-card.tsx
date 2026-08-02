import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur-xl",
        "transition-all duration-200 hover:border-primary/30 active:scale-[0.98]",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      {/* Soft teal corner wash — no hard circle edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_100%_0%,oklch(0.74_0.12_195_/_0.16),transparent_58%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-28 bg-primary/20 blur-3xl"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-2 truncate text-xl font-semibold tracking-tight md:text-2xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
