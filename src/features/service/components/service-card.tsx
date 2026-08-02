"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SwipeableRow } from "@/components/shared/swipeable-row";
import { useCurrency } from "@/components/providers/app-settings-provider";
import {
  ServiceActionsMenu,
  type ServiceAction,
} from "@/features/service/components/service-actions-menu";
import { useLongPress } from "@/features/cars/hooks/use-long-press";
import {
  calculateServiceStatus,
  formatServiceDate,
  getServiceTypeLabel,
  normalizeServiceRecord,
} from "@/features/service/utils";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ServiceRecord, ServiceStatus } from "@/types";

type ServiceCardProps = {
  record: ServiceRecord;
  kmDrivenSince?: number;
  onAction: (record: ServiceRecord, action: ServiceAction) => void;
};

const STATUS_STYLES: Record<ServiceStatus, string> = {
  completed: "bg-muted text-muted-foreground",
  upcoming: "bg-primary/15 text-primary",
  due_soon: "bg-warning/20 text-warning",
  overdue: "bg-destructive/15 text-destructive",
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  completed: "Done",
  upcoming: "Upcoming",
  due_soon: "Due soon",
  overdue: "Overdue",
};

export function ServiceCard({
  record,
  kmDrivenSince,
  onAction,
}: ServiceCardProps) {
  const router = useRouter();
  const currency = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const normalized = normalizeServiceRecord(record);
  const status = calculateServiceStatus(normalized, { kmDrivenSince });

  const longPress = useLongPress({
    onLongPress: () => setMenuOpen(true),
    onClick: () => router.push(`/service/${record.id}`),
  });

  const reminderLabel = !normalized.reminderEnabled
    ? "No reminder"
    : normalized.repeatUnit === "kilometers" && normalized.repeatInterval
      ? `Every ${normalized.repeatInterval} km`
      : normalized.nextDate
        ? `Due ${formatServiceDate(normalized.nextDate)}`
        : normalized.repeatInterval && normalized.repeatUnit
          ? `Every ${normalized.repeatInterval} ${normalized.repeatUnit}`
          : "Reminder on";

  return (
    <SwipeableRow onAction={(action) => onAction(record, action)}>
      <article
        className={cn(
          "rounded-3xl border border-border/60 bg-card/90 p-4 backdrop-blur-md",
          "animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]",
          "touch-manipulation select-none active:scale-[0.99]",
        )}
        {...longPress}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-lg text-[10px]">
                {getServiceTypeLabel(normalized.type)}
              </Badge>
              <Badge
                className={cn(
                  "rounded-lg text-[10px] capitalize hover:bg-inherit",
                  STATUS_STYLES[status],
                )}
              >
                {STATUS_LABELS[status]}
              </Badge>
            </div>
            <h3 className="mt-2 text-sm font-semibold tracking-tight">
              {normalized.title}
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
            value={formatServiceDate(normalized.dateCompleted)}
          />
          <Meta
            label="Cost"
            value={formatCurrency(normalized.cost, currency)}
          />
          <Meta label="Repeat" value={reminderLabel} />
          <Meta
            label="Notes"
            value={normalized.notes?.trim() ? "Added" : "—"}
          />
        </div>
      </article>
    </SwipeableRow>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-2.5 py-2">
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 truncate font-medium text-foreground">{value}</p>
    </div>
  );
}
