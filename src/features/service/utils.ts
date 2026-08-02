import type {
  CreateServiceInput,
  FuelEntry,
  RepeatUnit,
  ServiceRecord,
  ServiceReminder,
  ServiceStatus,
  ServiceStats,
  ServiceType,
} from "@/types";
import type { ServiceFormValues } from "@/lib/validations/service";
import { parseLocaleNumber } from "@/lib/numbers";
import { createId } from "@/features/cars/utils";
import { sumDistanceSince } from "@/features/fuel/utils";
import {
  SERVICE_TYPE_LABELS,
  UPCOMING_DAY_THRESHOLD,
  UPCOMING_KM_THRESHOLD,
} from "@/features/service/constants";

export { createId };

const DUE_SOON_DAYS = 7;
const DUE_SOON_KM = 300;

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

export function computeNextDate(
  dateCompleted: string,
  interval: number,
  unit: RepeatUnit,
): string | undefined {
  if (unit === "kilometers") return undefined;
  const date = new Date(dateCompleted);
  if (Number.isNaN(date.getTime()) || interval <= 0) return undefined;
  if (unit === "months") {
    date.setMonth(date.getMonth() + interval);
  } else {
    date.setFullYear(date.getFullYear() + interval);
  }
  return date.toISOString().slice(0, 10);
}

export function normalizeServiceRecord(record: ServiceRecord): ServiceRecord {
  const reminderEnabled =
    record.reminderEnabled ??
    Boolean(record.nextDate || record.nextOdometer || record.repeatInterval);

  return {
    ...record,
    reminderEnabled,
    odometerCompleted: record.odometerCompleted ?? 0,
    attachments: record.attachments ?? [],
  };
}

export type ServiceStatusContext = {
  now?: Date;
  /** Kilometers driven since this service entry (fuel distances) */
  kmDrivenSince?: number;
};

/**
 * Status for a service entry reminder:
 * - Overdue / Due soon / Upcoming / Completed (no active reminder)
 */
export function calculateServiceStatus(
  record: ServiceRecord,
  ctx: ServiceStatusContext = {},
): ServiceStatus {
  const normalized = normalizeServiceRecord(record);
  if (!normalized.reminderEnabled) return "completed";

  const now = ctx.now ?? new Date();
  const unit = normalized.repeatUnit;
  const interval = normalized.repeatInterval;

  let daysRemaining: number | null = null;
  let kmRemaining: number | null = null;

  if (unit === "kilometers" && interval) {
    const driven = ctx.kmDrivenSince ?? 0;
    kmRemaining = interval - driven;
  } else if (normalized.nextDate) {
    daysRemaining = daysBetween(now, new Date(normalized.nextDate));
  } else if (normalized.nextOdometer != null && ctx.kmDrivenSince != null) {
    // Legacy absolute odometer fallback treated as remaining unknown
    kmRemaining = null;
  }

  if (
    (daysRemaining !== null && daysRemaining < 0) ||
    (kmRemaining !== null && kmRemaining < 0)
  ) {
    return "overdue";
  }

  if (
    (daysRemaining !== null && daysRemaining <= DUE_SOON_DAYS) ||
    (kmRemaining !== null && kmRemaining <= DUE_SOON_KM)
  ) {
    return "due_soon";
  }

  if (
    (daysRemaining !== null && daysRemaining <= UPCOMING_DAY_THRESHOLD) ||
    (kmRemaining !== null && kmRemaining <= UPCOMING_KM_THRESHOLD)
  ) {
    return "upcoming";
  }

  // Reminder scheduled but still far out — treat as completed for list filters
  return "completed";
}

export function buildServiceReminder(
  record: ServiceRecord,
  ctx: ServiceStatusContext = {},
): ServiceReminder | null {
  const normalized = normalizeServiceRecord(record);
  if (!normalized.reminderEnabled) return null;

  const status = calculateServiceStatus(normalized, ctx);
  if (status === "completed") return null;

  const now = ctx.now ?? new Date();
  let daysRemaining: number | null = null;
  let kmRemaining: number | null = null;

  if (normalized.repeatUnit === "kilometers" && normalized.repeatInterval) {
    kmRemaining = normalized.repeatInterval - (ctx.kmDrivenSince ?? 0);
  } else if (normalized.nextDate) {
    daysRemaining = daysBetween(now, new Date(normalized.nextDate));
  }

  let priority: ServiceReminder["priority"] = "low";
  if (status === "overdue") priority = "high";
  else if (status === "due_soon") priority = "high";
  else if (status === "upcoming") priority = "medium";

  return {
    id: `reminder-${normalized.id}`,
    carId: normalized.carId,
    recordId: normalized.id,
    title: normalized.title,
    type: normalized.type,
    nextDate: normalized.nextDate,
    nextOdometer: normalized.nextOdometer,
    daysRemaining,
    kmRemaining,
    priority,
    status,
    repeatInterval: normalized.repeatInterval,
    repeatUnit: normalized.repeatUnit,
  };
}

export function getUpcomingReminders(
  records: ServiceRecord[],
  fuelEntries: FuelEntry[] = [],
  now = new Date(),
): ServiceReminder[] {
  return records
    .map((record) => {
      const normalized = normalizeServiceRecord(record);
      const kmDrivenSince = sumDistanceSince(
        fuelEntries,
        normalized.carId,
        normalized.dateCompleted,
      );
      return buildServiceReminder(normalized, { now, kmDrivenSince });
    })
    .filter((item): item is ServiceReminder => item !== null)
    .sort((a, b) => {
      const statusRank = { overdue: 0, due_soon: 1, upcoming: 2 };
      if (statusRank[a.status] !== statusRank[b.status]) {
        return statusRank[a.status] - statusRank[b.status];
      }
      const aDays = a.daysRemaining ?? Number.POSITIVE_INFINITY;
      const bDays = b.daysRemaining ?? Number.POSITIVE_INFINITY;
      const aKm = a.kmRemaining ?? Number.POSITIVE_INFINITY;
      const bKm = b.kmRemaining ?? Number.POSITIVE_INFINITY;
      return Math.min(aDays, aKm / 50) - Math.min(bDays, bKm / 50);
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
  const notes = values.notes.trim() || undefined;
  const interval = values.reminderEnabled
    ? parseLocaleNumber(values.repeatInterval)
    : undefined;
  const unit = values.reminderEnabled ? values.repeatUnit : undefined;
  const nextDate =
    values.reminderEnabled && interval && unit
      ? computeNextDate(values.dateCompleted, interval, unit)
      : undefined;

  return {
    carId: values.carId,
    type: values.type,
    title: values.title.trim(),
    dateCompleted: values.dateCompleted,
    cost: parseLocaleNumber(values.cost),
    notes,
    reminderEnabled: values.reminderEnabled,
    repeatInterval:
      values.reminderEnabled && Number.isFinite(interval)
        ? interval
        : undefined,
    repeatUnit: unit,
    nextDate,
    odometerCompleted: 0,
    attachments: [],
  };
}

export function serviceToFormValues(record: ServiceRecord): ServiceFormValues {
  const normalized = normalizeServiceRecord(record);
  return {
    carId: normalized.carId,
    type: normalized.type,
    title: normalized.title,
    dateCompleted: normalized.dateCompleted.slice(0, 10),
    cost: normalized.cost.toString(),
    notes: normalized.notes ?? "",
    reminderEnabled: normalized.reminderEnabled,
    repeatInterval: normalized.repeatInterval?.toString() ?? "",
    repeatUnit: normalized.repeatUnit ?? "months",
  };
}

export function duplicateServiceInput(
  record: ServiceRecord,
): CreateServiceInput {
  const normalized = normalizeServiceRecord(record);
  const nextDate =
    normalized.reminderEnabled &&
    normalized.repeatInterval &&
    normalized.repeatUnit
      ? computeNextDate(
          new Date().toISOString().slice(0, 10),
          normalized.repeatInterval,
          normalized.repeatUnit,
        )
      : undefined;

  return {
    carId: normalized.carId,
    type: normalized.type,
    title: `${normalized.title} (Copy)`,
    dateCompleted: new Date().toISOString().slice(0, 10),
    cost: normalized.cost,
    notes: normalized.notes,
    reminderEnabled: normalized.reminderEnabled,
    repeatInterval: normalized.repeatInterval,
    repeatUnit: normalized.repeatUnit,
    nextDate,
    odometerCompleted: 0,
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
