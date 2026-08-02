import type {
  Car,
  FuelEntry,
  FuelStats,
  ServiceRecord,
  ServiceReminder,
} from "@/types";
import { computeFuelStats, EMPTY_FUEL_STATS } from "@/features/fuel/utils";
import { getCarDisplayName } from "@/features/cars/utils";
import { selectDashboardReminders } from "@/features/service/selectors";
import { getServiceTypeLabel } from "@/features/service/utils";

export type DashboardActivityType = "fuel" | "car" | "service";

export type DashboardActivityItem = {
  id: string;
  type: DashboardActivityType;
  title: string;
  subtitle: string;
  date: string;
  href?: string;
};

export type MonthlyOverview = FuelStats & {
  entryCount: number;
};

export type DashboardSnapshot = {
  activeCar: Car | null;
  cars: Car[];
  fuelEntries: FuelEntry[];
  lastFuelEntry: FuelEntry | null;
  overallStats: FuelStats;
  monthlyStats: MonthlyOverview;
  entryCount: number;
  activities: DashboardActivityItem[];
  upcomingReminders: ServiceReminder[];
};

export function getGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDashboardDate(now = new Date()): string {
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function isInCurrentMonth(dateValue: string, now = new Date()): boolean {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function selectEntriesInCurrentMonth(
  entries: FuelEntry[],
  now = new Date(),
): FuelEntry[] {
  return entries.filter((entry) => isInCurrentMonth(entry.date, now));
}

export function selectMonthlyOverview(
  entries: FuelEntry[],
  now = new Date(),
): MonthlyOverview {
  const monthly = selectEntriesInCurrentMonth(entries, now);
  return {
    ...computeFuelStats(monthly),
    entryCount: monthly.length,
  };
}

export function selectLastFuelEntry(
  entries: FuelEntry[],
): FuelEntry | null {
  if (entries.length === 0) return null;
  return [...entries].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
}

export function selectRecentActivity(
  cars: Car[],
  fuelEntries: FuelEntry[],
  serviceRecords: ServiceRecord[] = [],
  limit = 8,
): DashboardActivityItem[] {
  const fuelActivities: DashboardActivityItem[] = fuelEntries.map((entry) => ({
    id: `fuel-${entry.id}`,
    type: "fuel",
    title: "Fuel entry",
    subtitle: entry.fuelStation
      ? `${entry.fuelStation} · ${entry.liters.toFixed(1)} L`
      : `${entry.liters.toFixed(1)} L · ${entry.totalCost.toFixed(2)}`,
    date: entry.createdAt || entry.date,
    href: `/fuel/${entry.id}`,
  }));

  const carActivities: DashboardActivityItem[] = cars.map((car) => ({
    id: `car-${car.id}`,
    type: "car",
    title: "Car added",
    subtitle: getCarDisplayName(car),
    date: car.createdAt,
    href: `/cars/${car.id}`,
  }));

  const serviceActivities: DashboardActivityItem[] = serviceRecords.map(
    (record) => ({
      id: `service-${record.id}`,
      type: "service",
      title: "Service added",
      subtitle: `${getServiceTypeLabel(record.type)} · ${record.title}`,
      date: record.createdAt || record.dateCompleted,
      href: `/service/${record.id}`,
    }),
  );

  return [...fuelActivities, ...carActivities, ...serviceActivities]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, limit);
}

export function buildDashboardSnapshot(input: {
  cars: Car[];
  activeCar: Car | null;
  fuelEntries: FuelEntry[];
  serviceRecords?: ServiceRecord[];
  odometerByCar?: Record<string, number | undefined>;
  now?: Date;
}): DashboardSnapshot {
  const now = input.now ?? new Date();
  const fuelEntries = input.fuelEntries;
  const serviceRecords = input.serviceRecords ?? [];
  const overallStats =
    fuelEntries.length > 0 ? computeFuelStats(fuelEntries) : EMPTY_FUEL_STATS;

  const odometerByCar = input.odometerByCar ?? {};
  if (input.activeCar && fuelEntries.length > 0 && !odometerByCar[input.activeCar.id]) {
    odometerByCar[input.activeCar.id] = Math.max(
      ...fuelEntries.map((e) => e.odometer),
    );
  }

  return {
    activeCar: input.activeCar,
    cars: input.cars,
    fuelEntries,
    lastFuelEntry: selectLastFuelEntry(fuelEntries),
    overallStats,
    monthlyStats: selectMonthlyOverview(fuelEntries, now),
    entryCount: fuelEntries.length,
    activities: selectRecentActivity(
      input.cars,
      fuelEntries,
      serviceRecords,
    ),
    upcomingReminders: selectDashboardReminders(
      serviceRecords,
      odometerByCar,
    ),
  };
}
