import type {
  CreateServiceInput,
  ServiceRecord,
  ServiceReminder,
  ServiceStatus,
  ServiceStats,
  ServiceType,
} from "@/types";
import type { ServiceFormValues } from "@/lib/validations/service";
import { createId } from "@/features/cars/utils";
import {
  SERVICE_TYPE_LABELS,
  UPCOMING_DAY_THRESHOLD,
  UPCOMING_KM_THRESHOLD,
} from "@/features/service/constants";

export { createId };

export function getServiceTypeLabel(type: ServiceType) {
  return SERVICE_TYPE_LABELS[type] ?? type;
}

export function formatServiceDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function daysBetween(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type ServiceStatusContext = {
  now?: Date;
  currentOdometer?: number;
};

/**
 * Status rules:
 * - Overdue: past nextDate OR past nextOdometer
 * - Upcoming: within 30 days OR within 1000 km of due
 * - Completed: no upcoming due, or due is further out
 */
export function calculateServiceStatus(
  record: Pick<ServiceRecord, "nextDate" | "nextOdometer">,
  ctx: ServiceStatusContext = {},
): ServiceStatus {
  const now = ctx.now ?? new Date();
  const hasDate = Boolean(record.nextDate);
  const hasOdo = record.nextOdometer !== undefined && record.nextOdometer !== null;

  if (!hasDate && !hasOdo) {
    return "completed";
  }

  let overdue = false;
  let upcoming = false;

  if (hasDate && record.nextDate) {
    const due = new Date(record.nextDate);
    const remaining = daysBetween(now, due);
    if (remaining < 0) overdue = true;
    else if (remaining <= UPCOMING_DAY_THRESHOLD) upcoming = true;
  }

  if (hasOdo && record.nextOdometer !== undefined) {
    const current = ctx.currentOdometer;
    if (current !== undefined) {
      const kmLeft = record.nextOdometer - current;
      if (kmLeft < 0) overdue = true;
      else if (kmLeft <= UPCOMING_KM_THRESHOLD) upcoming = true;
    }
  }

  if (overdue) return "overdue";
  if (upcoming) return "upcoming";
  return "completed";
}

export function buildServiceReminder(
  record: ServiceRecord,
  ctx: ServiceStatusContext = {},
): ServiceReminder | null {
  const status = calculateServiceStatus(record, ctx);
  if (status === "completed") return null;
  if (!record.nextDate && record.nextOdometer === undefined) return null;

  const now = ctx.now ?? new Date();
  let daysRemaining: number | null = null;
  let kmRemaining: number | null = null;

  if (record.nextDate) {
    daysRemaining = daysBetween(now, new Date(record.nextDate));
  }
  if (record.nextOdometer !== undefined && ctx.currentOdometer !== undefined) {
    kmRemaining = record.nextOdometer - ctx.currentOdometer;
  }

  let priority: ServiceReminder["priority"] = "low";
  if (status === "overdue") priority = "high";
  else if (
    (daysRemaining !== null && daysRemaining <= 7) ||
    (kmRemaining !== null && kmRemaining <= 300)
  ) {
    priority = "high";
  } else if (
    (daysRemaining !== null && daysRemaining <= UPCOMING_DAY_THRESHOLD) ||
    (kmRemaining !== null && kmRemaining <= UPCOMING_KM_THRESHOLD)
  ) {
    priority = "medium";
  }

  return {
    id: `reminder-${record.id}`,
    carId: record.carId,
    recordId: record.id,
    title: record.title,
    type: record.type,
    nextDate: record.nextDate,
    nextOdometer: record.nextOdometer,
    daysRemaining,
    kmRemaining,
    priority,
    status,
  };
}

export function getUpcomingReminders(
  records: ServiceRecord[],
  odometerByCar: Record<string, number | undefined> = {},
  now = new Date(),
): ServiceReminder[] {
  return records
    .map((record) =>
      buildServiceReminder(record, {
        now,
        currentOdometer: odometerByCar[record.carId],
      }),
    )
    .filter((item): item is ServiceReminder => item !== null)
    .sort((a, b) => {
      const priorityRank = { high: 0, medium: 1, low: 2 };
      if (priorityRank[a.priority] !== priorityRank[b.priority]) {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }
      const aDays = a.daysRemaining ?? Number.POSITIVE_INFINITY;
      const bDays = b.daysRemaining ?? Number.POSITIVE_INFINITY;
      return aDays - bDays;
    });
}

export function computeServiceStats(
  records: ServiceRecord[],
  now = new Date(),
): ServiceStats {
  if (records.length === 0) {
    return {
      totalMaintenanceCost: 0,
      costThisMonth: 0,
      costThisYear: 0,
      mostCommonService: null,
      mostCommonServiceCount: 0,
      averageYearlyMaintenance: 0,
      recordCount: 0,
    };
  }

  const totalMaintenanceCost =
    Math.round(records.reduce((sum, r) => sum + r.cost, 0) * 100) / 100;

  const year = now.getFullYear();
  const month = now.getMonth();

  const costThisMonth =
    Math.round(
      records
        .filter((r) => {
          const d = new Date(r.dateCompleted);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, r) => sum + r.cost, 0) * 100,
    ) / 100;

  const costThisYear =
    Math.round(
      records
        .filter((r) => new Date(r.dateCompleted).getFullYear() === year)
        .reduce((sum, r) => sum + r.cost, 0) * 100,
    ) / 100;

  const counts = new Map<ServiceType, number>();
  for (const record of records) {
    counts.set(record.type, (counts.get(record.type) ?? 0) + 1);
  }
  let mostCommonService: ServiceType | null = null;
  let mostCommonServiceCount = 0;
  for (const [type, count] of counts) {
    if (count > mostCommonServiceCount) {
      mostCommonService = type;
      mostCommonServiceCount = count;
    }
  }

  const years = new Set(
    records.map((r) => new Date(r.dateCompleted).getFullYear()),
  );
  const yearCount = Math.max(1, years.size);
  const averageYearlyMaintenance =
    Math.round((totalMaintenanceCost / yearCount) * 100) / 100;

  return {
    totalMaintenanceCost,
    costThisMonth,
    costThisYear,
    mostCommonService,
    mostCommonServiceCount,
    averageYearlyMaintenance,
    recordCount: records.length,
  };
}

export function formValuesToServiceInput(
  values: ServiceFormValues,
): CreateServiceInput {
  const empty = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  };

  return {
    carId: values.carId,
    type: values.type,
    title: values.title.trim(),
    description: empty(values.description),
    dateCompleted: values.dateCompleted,
    odometerCompleted: Number(values.odometerCompleted),
    nextDate: empty(values.nextDate),
    nextOdometer: values.nextOdometer.trim()
      ? Number(values.nextOdometer)
      : undefined,
    cost: Number(values.cost),
    garageName: empty(values.garageName),
    invoiceNumber: empty(values.invoiceNumber),
    notes: empty(values.notes),
    attachments: [],
  };
}

export function serviceToFormValues(record: ServiceRecord): ServiceFormValues {
  return {
    carId: record.carId,
    type: record.type,
    title: record.title,
    description: record.description ?? "",
    dateCompleted: record.dateCompleted.slice(0, 10),
    odometerCompleted: record.odometerCompleted.toString(),
    nextDate: record.nextDate?.slice(0, 10) ?? "",
    nextOdometer: record.nextOdometer?.toString() ?? "",
    cost: record.cost.toString(),
    garageName: record.garageName ?? "",
    invoiceNumber: record.invoiceNumber ?? "",
    notes: record.notes ?? "",
  };
}

export function duplicateServiceInput(
  record: ServiceRecord,
): CreateServiceInput {
  return {
    carId: record.carId,
    type: record.type,
    title: `${record.title} (Copy)`,
    description: record.description,
    dateCompleted: new Date().toISOString().slice(0, 10),
    odometerCompleted: record.odometerCompleted,
    nextDate: record.nextDate,
    nextOdometer: record.nextOdometer,
    cost: record.cost,
    garageName: record.garageName,
    invoiceNumber: undefined,
    notes: record.notes,
    attachments: [],
  };
}

export const EMPTY_SERVICE_STATS: ServiceStats = {
  totalMaintenanceCost: 0,
  costThisMonth: 0,
  costThisYear: 0,
  mostCommonService: null,
  mostCommonServiceCount: 0,
  averageYearlyMaintenance: 0,
  recordCount: 0,
};
