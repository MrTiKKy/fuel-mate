"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Car, FuelEntry } from "@/types";
import * as carsRepo from "@/features/cars/repository";
import * as fuelRepo from "@/features/fuel/repository";
import {
  DEFAULT_STATS_FILTERS,
  type StatsFilters,
} from "@/features/statistics/services/filters";
import {
  buildStatisticsSnapshot,
  EMPTY_STATISTICS_SNAPSHOT,
  type StatisticsSnapshot,
} from "@/features/statistics/selectors";

export function useStatistics() {
  const [cars, setCars] = useState<Car[]>([]);
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [filters, setFilters] = useState<StatsFilters>(DEFAULT_STATS_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextCars, nextEntries, activeCarId] = await Promise.all([
        carsRepo.getCars(),
        fuelRepo.getFuelEntries(),
        carsRepo.getActiveCarId(),
      ]);
      setCars(nextCars);
      setEntries(nextEntries);
      setFilters((prev) => ({
        ...prev,
        carId:
          prev.carId === "all"
            ? "all"
            : nextCars.some((c) => c.id === prev.carId)
              ? prev.carId
              : (activeCarId ?? "all"),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const snapshot: StatisticsSnapshot = useMemo(() => {
    if (isLoading && entries.length === 0) return EMPTY_STATISTICS_SNAPSHOT;
    return buildStatisticsSnapshot({ entries, cars, filters });
  }, [entries, cars, filters, isLoading]);

  const updateFilters = useCallback((partial: Partial<StatsFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    cars,
    entries,
    isLoading,
    error,
    refresh,
    updateFilters,
    ...snapshot,
  };
}
