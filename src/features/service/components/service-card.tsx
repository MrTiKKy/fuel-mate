"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ServiceActionsMenu,
  type ServiceAction,
} from "@/features/service/components/service-actions-menu";
import { useLongPress } from "@/features/cars/hooks/use-long-press";
import {
  calculateServiceStatus,
  formatServiceDate,
  getServiceTypeLabel,
} from "@/features/service/utils";
import { formatCurrency, formatDistance } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ServiceRecord, ServiceStatus } from "@/types";

type ServiceCardProps = {
  record: ServiceRecord;
  currentOdometer?: number;
  onAction: (record: ServiceRecord, action: ServiceAction) => void;
};

const STATUS_STYLES: Record<ServiceStatus, string> = {
  completed: "bg-muted text-muted-foreground",
  upcoming: "bg-primary/15 text-primary",
  overdue: "bg-destructive/15 text-destructive",
};

export function ServiceCard({
  record,
  currentOdometer,
  onAction,
}: ServiceCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const status = calculateServiceStatus(record, { currentOdometer });

  const longPress = useLongPress({
    onLongPress: () => setMenuOpen(true),
    onClick: () => router.push(`/service/${record.id}`),
  });

  return (
    <article
      className={cn(
        "relative rounded-2xl border border-border/70 bg-card p-4",
        "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        "touch-manipulation select-none active:scale-[0.99]",
      )}
      {...longPress}
    >
      <div className="absolute bottom-4 left-0 top-4 w-0.5 rounded-full bg-primary/40" />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-lg text-[10px]">
                {getServiceTypeLabel(record.type)}
              </Badge>
              <Badge
                className={cn(
                  "rounded-lg text-[10px] capitalize hover:bg-inherit",
                  STATUS_STYLES[status],
                )}
              >
                {status}
              </Badge>
            </div>
            <h3 className="mt-2 text-sm font-semibold tracking-tight">
              {record.title}
            </h3>
          </div>
          <div className="pointer-events-auto">
            <ServiceActionsMenu
              record={record}
              open={menuOpen}
              onOpenChange={setMenuOpen}
              onAction={(action) => onAction(record, action)}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Meta
            label="Completed"
            value={formatServiceDate(record.dateCompleted)}
          />
          <Meta
            label="Mileage"
            value={formatDistance(record.odometerCompleted)}
          />
          <Meta
            label="Next due"
            value={
              record.nextDate
                ? formatServiceDate(record.nextDate)
                : record.nextOdometer !== undefined
                  ? formatDistance(record.nextOdometer)
                  : "—"
            }
          />
          <Meta label="Cost" value={formatCurrency(record.cost)} />
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-2.5 py-2">
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
