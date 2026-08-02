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
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4",
        "transition-all duration-200 hover:border-primary/30 active:scale-[0.98]",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110" />
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
