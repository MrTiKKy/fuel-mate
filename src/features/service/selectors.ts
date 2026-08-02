import type {
  ServiceRecord,
  ServiceReminder,
  ServiceStatus,
  ServiceType,
} from "@/types";
import {
  calculateServiceStatus,
  getUpcomingReminders,
} from "@/features/service/utils";

export type ServiceFilters = {
  carId: string | "all";
  type: ServiceType | "all";
  status: ServiceStatus | "all";
  dateFrom?: string;
  dateTo?: string;
  query: string;
};

export const DEFAULT_SERVICE_FILTERS: ServiceFilters = {
  carId: "all",
  type: "all",
  status: "all",
  query: "",
};

export function filterServiceRecords(
  records: ServiceRecord[],
  filters: ServiceFilters,
  odometerByCar: Record<string, number | undefined> = {},
  now = new Date(),
): ServiceRecord[] {
  const query = filters.query.trim().toLowerCase();

  return records.filter((record) => {
    if (filters.carId !== "all" && record.carId !== filters.carId) {
      return false;
    }
    if (filters.type !== "all" && record.type !== filters.type) {
      return false;
    }

    const status = calculateServiceStatus(record, {
      now,
      currentOdometer: odometerByCar[record.carId],
    });
    if (filters.status !== "all" && status !== filters.status) {
      return false;
    }

    if (filters.dateFrom) {
      if (new Date(record.dateCompleted) < new Date(filters.dateFrom)) {
        return false;
      }
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(record.dateCompleted) > to) {
        return false;
      }
    }

    if (query) {
      const haystack = [
        record.title,
        record.garageName ?? "",
        record.notes ?? "",
        record.description ?? "",
        record.invoiceNumber ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export function groupRecordsByCar(
  records: ServiceRecord[],
): Map<string, ServiceRecord[]> {
  const map = new Map<string, ServiceRecord[]>();
  for (const record of records) {
    const list = map.get(record.carId) ?? [];
    list.push(record);
    map.set(record.carId, list);
  }
  for (const [carId, list] of map) {
    map.set(
      carId,
      [...list].sort(
        (a, b) =>
          new Date(b.dateCompleted).getTime() -
          new Date(a.dateCompleted).getTime(),
      ),
    );
  }
  return map;
}

export function selectDashboardReminders(
  records: ServiceRecord[],
  odometerByCar: Record<string, number | undefined>,
  limit = 4,
): ServiceReminder[] {
  return getUpcomingReminders(records, odometerByCar).slice(0, limit);
}
