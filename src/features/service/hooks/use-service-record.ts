"use client";

import { useCallback, useEffect, useState } from "react";
import type { Car, ServiceRecord } from "@/types";
import * as carsRepo from "@/features/cars/repository";
import * as fuelRepo from "@/features/fuel/repository";
import * as serviceRepo from "@/features/service/repository";
import { sumDistanceSince } from "@/features/fuel/utils";
import { normalizeServiceRecord } from "@/features/service/utils";

export function useServiceRecord(id: string) {
  const [record, setRecord] = useState<ServiceRecord | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [kmDrivenSince, setKmDrivenSince] = useState<number | undefined>();
  const [history, setHistory] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const found = await serviceRepo.getServiceRecord(id);
      if (!found) {
        setRecord(null);
        setCar(null);
        setHistory([]);
        setNotFound(true);
        return;
      }

      const normalized = normalizeServiceRecord(found);
      const [vehicle, carRecords, fuelEntries] = await Promise.all([
        carsRepo.getCar(normalized.carId),
        serviceRepo.getServiceRecordsByCar(normalized.carId),
        fuelRepo.getFuelEntriesByCar(normalized.carId),
      ]);

      setRecord(normalized);
      setCar(vehicle ?? null);
      setHistory(
        carRecords
          .map(normalizeServiceRecord)
          .filter((r) => r.id !== normalized.id)
          .slice(0, 8),
      );
      setKmDrivenSince(
        sumDistanceSince(
          fuelEntries,
          normalized.carId,
          normalized.dateCompleted,
        ),
      );
      setNotFound(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load record");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    record,
    car,
    kmDrivenSince,
    history,
    isLoading,
    notFound,
    error,
    refresh,
  };
}
