import Link from "next/link";
import { Car, ChevronRight, FileText, Fuel, Wrench } from "lucide-react";
import type { DashboardActivityItem } from "@/features/dashboard/selectors";
import { cn } from "@/lib/utils";

type ActivityCardProps = {
  item: DashboardActivityItem;
  className?: string;
};

const ICONS = {
  fuel: Fuel,
  car: Car,
  service: Wrench,
  document: FileText,
} as const;

export function ActivityCard({ item, className }: ActivityCardProps) {
  const Icon = ICONS[item.type];
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3.5",
        "transition-all duration-200",
        item.href && "hover:border-primary/30 active:scale-[0.99]",
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tracking-tight">{item.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.subtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        <time className="text-[10px]">
          {new Date(item.date).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}
        </time>
        {item.href ? <ChevronRight className="size-4" /> : null}
      </div>
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{content}</Link>;
  }

  return content;
}
