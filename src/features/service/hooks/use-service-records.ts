"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  Car,
  CreateServiceInput,
  FuelEntry,
  ServiceRecord,
  UpdateServiceInput,
} from "@/types";
import * as carsRepo from "@/features/cars/repository";
import * as fuelRepo from "@/features/fuel/repository";
import * as serviceRepo from "@/features/service/repository";
import {
  DEFAULT_SERVICE_FILTERS,
  filterServiceRecords,
  groupRecordsByCar,
  type ServiceFilters,
} from "@/features/service/selectors";
import {
  computeServiceStats,
  duplicateServiceInput,
  EMPTY_SERVICE_STATS,
  getUpcomingReminders,
  normalizeServiceRecord,
} from "@/features/service/utils";

export function useServiceRecords() {
  const [cars, setCars] = useState<Car[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_SERVICE_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextCars, nextRecords, nextFuel] = await Promise.all([
        carsRepo.getCars(),
        serviceRepo.getServiceRecords(),
        fuelRepo.getFuelEntries(),
      ]);

      setCars(nextCars);
      setRecords(nextRecords.map(normalizeServiceRecord));
      setFuelEntries(nextFuel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(
    () => filterServiceRecords(records, filters, fuelEntries),
    [records, filters, fuelEntries],
  );

  const grouped = useMemo(() => groupRecordsByCar(filtered), [filtered]);

  const reminders = useMemo(
    () => getUpcomingReminders(records, fuelEntries),
    [records, fuelEntries],
  );

  const stats = useMemo(() => computeServiceStats(filtered), [filtered]);

  const updateFilters = useCallback((partial: Partial<ServiceFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const createRecord = useCallback(
    async (input: CreateServiceInput) => {
      const record = await serviceRepo.createServiceRecord(input);
      await refresh();
      toast.success("Service entry added");
      return record;
    },
    [refresh],
  );

  const updateRecord = useCallback(
    async (id: string, input: UpdateServiceInput) => {
      const record = await serviceRepo.updateServiceRecord(id, input);
      await refresh();
      toast.success("Service entry updated");
      return record;
    },
    [refresh],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      await serviceRepo.deleteServiceRecord(id);
      await refresh();
      toast.success("Service entry deleted");
    },
    [refresh],
  );

  const duplicateRecord = useCallback(
    async (record: ServiceRecord) => {
      const created = await serviceRepo.createServiceRecord(
        duplicateServiceInput(record),
      );
      await refresh();
      toast.success("Service entry duplicated");
      return created;
    },
    [refresh],
  );

  const run = useCallback((action: () => Promise<unknown>) => {
    startTransition(() => {
      void action().catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      });
    });
  }, []);

  return {
    cars,
    records,
    fuelEntries,
    filtered,
    grouped,
    filters,
    updateFilters,
    reminders,
    stats: filtered.length ? stats : EMPTY_SERVICE_STATS,
    isLoading,
    isPending,
    error,
    refresh,
    createRecord,
    updateRecord,
    deleteRecord,
    duplicateRecord,
    run,
  };
}
