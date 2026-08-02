"use client";

import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  empty?: boolean;
  emptyMessage?: string;
};

export function ChartCard({
  title,
  description,
  children,
  className,
  empty,
  emptyMessage = "Not enough data yet",
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {empty ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="h-56 w-full">{children}</div>
      )}
    </div>
  );
}
