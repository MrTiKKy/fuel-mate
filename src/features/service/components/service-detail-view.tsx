import {
  Calendar,
  Gauge,
  MapPin,
  NotebookPen,
  Receipt,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/shared/section";
import {
  calculateServiceStatus,
  formatServiceDate,
  getServiceTypeLabel,
} from "@/features/service/utils";
import { formatCurrency, formatDistance } from "@/lib/formatters";
import { getCarDisplayName } from "@/features/cars/utils";
import { cn } from "@/lib/utils";
import type { Car, ServiceRecord } from "@/types";

type ServiceDetailViewProps = {
  record: ServiceRecord;
  car?: Car | null;
  currentOdometer?: number;
  history?: ServiceRecord[];
};

export function ServiceDetailView({
  record,
  car,
  currentOdometer,
  history = [],
}: ServiceDetailViewProps) {
  const status = calculateServiceStatus(record, { currentOdometer });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-lg">
              {getServiceTypeLabel(record.type)}
            </Badge>
            <Badge className="rounded-lg capitalize">{status}</Badge>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            {record.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {car ? getCarDisplayName(car) : "Unknown vehicle"}
          </p>
        </div>
      </div>

      <DetailSection title="General information">
        <DetailRow
          icon={Calendar}
          label="Completed"
          value={formatServiceDate(record.dateCompleted)}
        />
        <Separator />
        <DetailRow
          icon={Gauge}
          label="Odometer"
          value={formatDistance(record.odometerCompleted)}
        />
        <Separator />
        <DetailRow
          icon={Wrench}
          label="Type"
          value={getServiceTypeLabel(record.type)}
        />
        {record.description ? (
          <>
            <Separator />
            <p className="px-4 py-3.5 text-sm text-muted-foreground">
              {record.description}
            </p>
          </>
        ) : null}
      </DetailSection>

      <DetailSection title="Costs">
        <DetailRow
          icon={Receipt}
          label="Cost"
          value={formatCurrency(record.cost)}
        />
        <Separator />
        <DetailRow
          icon={Receipt}
          label="Invoice"
          value={record.invoiceNumber || "—"}
        />
      </DetailSection>

      <DetailSection title="Garage">
        <DetailRow
          icon={MapPin}
          label="Garage"
          value={record.garageName || "—"}
        />
      </DetailSection>

      <DetailSection title="Reminder information">
        <DetailRow
          icon={Calendar}
          label="Next date"
          value={
            record.nextDate ? formatServiceDate(record.nextDate) : "—"
          }
        />
        <Separator />
        <DetailRow
          icon={Gauge}
          label="Next odometer"
          value={
            record.nextOdometer !== undefined
              ? formatDistance(record.nextOdometer)
              : "—"
          }
        />
        {currentOdometer !== undefined ? (
          <>
            <Separator />
            <DetailRow
              icon={Gauge}
              label="Current odometer"
              value={formatDistance(currentOdometer)}
            />
          </>
        ) : null}
      </DetailSection>

      <DetailSection title="Notes">
        <p
          className={cn(
            "flex gap-3 px-4 py-4 text-sm leading-relaxed",
            record.notes ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {record.notes || "No notes."}
        </p>
      </DetailSection>

      {history.length > 0 ? (
        <Section title="History" description="Other services on this vehicle">
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/70 bg-card px-4 py-3"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatServiceDate(item.dateCompleted)} ·{" "}
                  {formatCurrency(item.cost)}
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
    <Section title={title}>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {children}
      </div>
    </Section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
