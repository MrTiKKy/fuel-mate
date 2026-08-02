"use client";

import { Calendar, Bell, NotebookPen, Receipt, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/shared/section";
import { useCurrency } from "@/components/providers/app-settings-provider";
import {
  calculateServiceStatus,
  formatServiceDate,
  getServiceTypeLabel,
  normalizeServiceRecord,
} from "@/features/service/utils";
import { formatCurrency } from "@/lib/formatters";
import { getCarDisplayName } from "@/features/cars/utils";
import { cn } from "@/lib/utils";
import type { Car, ServiceRecord } from "@/types";

type ServiceDetailViewProps = {
  record: ServiceRecord;
  car?: Car | null;
  kmDrivenSince?: number;
  history?: ServiceRecord[];
};

export function ServiceDetailView({
  record,
  car,
  kmDrivenSince,
  history = [],
}: ServiceDetailViewProps) {
  const currency = useCurrency();
  const normalized = normalizeServiceRecord(record);
  const status = calculateServiceStatus(normalized, { kmDrivenSince });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-5">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-lg">
              {getServiceTypeLabel(normalized.type)}
            </Badge>
            <Badge className="rounded-lg capitalize">
              {status.replace("_", " ")}
            </Badge>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            {normalized.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {car ? getCarDisplayName(car) : "Unknown vehicle"}
          </p>
        </div>
      </div>

      <DetailSection title="Service entry">
        <DetailRow
          icon={Calendar}
          label="Date completed"
          value={formatServiceDate(normalized.dateCompleted)}
        />
        <Separator />
        <DetailRow
          icon={Wrench}
          label="Type"
          value={getServiceTypeLabel(normalized.type)}
        />
        <Separator />
        <DetailRow
          icon={Receipt}
          label="Cost"
          value={formatCurrency(normalized.cost, currency)}
        />
      </DetailSection>

      <DetailSection title="Reminder">
        <DetailRow
          icon={Bell}
          label="Reminder"
          value={normalized.reminderEnabled ? "Enabled" : "Off"}
        />
        {normalized.reminderEnabled ? (
          <>
            <Separator />
            <DetailRow
              icon={Bell}
              label="Repeat"
              value={
                normalized.repeatInterval && normalized.repeatUnit
                  ? `Every ${normalized.repeatInterval} ${normalized.repeatUnit}`
                  : "—"
              }
            />
            {normalized.nextDate ? (
              <>
                <Separator />
                <DetailRow
                  icon={Calendar}
                  label="Next due"
                  value={formatServiceDate(normalized.nextDate)}
                />
              </>
            ) : null}
            {normalized.repeatUnit === "kilometers" ? (
              <>
                <Separator />
                <DetailRow
                  icon={Bell}
                  label="Km since service"
                  value={`${Math.round(kmDrivenSince ?? 0)} km`}
                />
              </>
            ) : null}
          </>
        ) : null}
      </DetailSection>

      <DetailSection title="Notes">
        <p
          className={cn(
            "flex gap-3 px-4 py-4 text-sm leading-relaxed",
            normalized.notes ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {normalized.notes || "No notes."}
        </p>
      </DetailSection>

      {history.length > 0 ? (
        <Section title="History" description="Other entries on this vehicle">
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatServiceDate(item.dateCompleted)} ·{" "}
                  {formatCurrency(item.cost, currency)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/90">
      <h3 className="border-b border-border/50 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
