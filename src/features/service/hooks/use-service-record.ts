"use client";

import { useCallback, useEffect, useState } from "react";
import type { Car, ServiceRecord } from "@/types";
import * as carsRepo from "@/features/cars/repository";
import * as fuelRepo from "@/features/fuel/repository";
import * as serviceRepo from "@/features/service/repository";

export function useServiceRecord(id: string) {
  const [record, setRecord] = useState<ServiceRecord | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [currentOdometer, setCurrentOdometer] = useState<number | undefined>();
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

      const [vehicle, carRecords, fuelEntries] = await Promise.all([
        carsRepo.getCar(found.carId),
        serviceRepo.getServiceRecordsByCar(found.carId),
        fuelRepo.getFuelEntriesByCar(found.carId),
      ]);

      setRecord(found);
      setCar(vehicle ?? null);
      setHistory(carRecords.filter((r) => r.id !== found.id).slice(0, 8));
      setCurrentOdometer(
        fuelEntries.length > 0
          ? Math.max(...fuelEntries.map((e) => e.odometer))
          : found.odometerCompleted,
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
    currentOdometer,
    history,
    isLoading,
    notFound,
    error,
    refresh,
  };
}
