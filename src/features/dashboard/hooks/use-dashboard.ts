"use client";

import { useCallback, useEffect, useState } from "react";
import * as carsRepo from "@/features/cars/repository";
import * as fuelRepo from "@/features/fuel/repository";
import * as serviceRepo from "@/features/service/repository";
import * as docsRepo from "@/features/documents/repository";
import {
  buildDashboardSnapshot,
  type DashboardSnapshot,
} from "@/features/dashboard/selectors";
import { EMPTY_FUEL_STATS } from "@/features/fuel/utils";

const emptySnapshot: DashboardSnapshot = {
  activeCar: null,
  cars: [],
  fuelEntries: [],
  lastFuelEntry: null,
  overallStats: EMPTY_FUEL_STATS,
  monthlyStats: { ...EMPTY_FUEL_STATS, entryCount: 0 },
  entryCount: 0,
  activities: [],
  upcomingReminders: [],
  documentReminders: [],
  missingDocumentTypes: [],
};

export function useDashboard() {
  const [data, setData] = useState<DashboardSnapshot>(emptySnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (opts?.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [cars, activeCar, serviceRecords, allFuel, documents] =
        await Promise.all([
          carsRepo.getCars(),
          carsRepo.getActiveCar(),
          serviceRepo.getServiceRecords(),
          fuelRepo.getFuelEntries(),
          docsRepo.getDocuments(),
        ]);

      const fuelEntries = activeCar
        ? allFuel.filter((e) => e.carId === activeCar.id)
        : [];

      setData(
        buildDashboardSnapshot({
          cars,
          activeCar: activeCar ?? null,
          fuelEntries,
          serviceRecords,
          allFuelEntries: allFuel,
          documents,
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  return {
    ...data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    reload: load,
  };
}
