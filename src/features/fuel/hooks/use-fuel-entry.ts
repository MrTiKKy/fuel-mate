"use client";

import { useCallback, useEffect, useState } from "react";
import type { Car, FuelEntry } from "@/types";
import * as fuelRepo from "@/features/fuel/repository";
import * as carsRepo from "@/features/cars/repository";

export function useFuelEntry(id: string) {
  const [entry, setEntry] = useState<FuelEntry | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const found = await fuelRepo.getFuelEntry(id);
      if (!found) {
        setEntry(null);
        setCar(null);
        setNotFound(true);
        return;
      }
      const vehicle = await carsRepo.getCar(found.carId);
      setEntry(found);
      setCar(vehicle ?? null);
      setNotFound(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entry");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entry, car, isLoading, error, notFound, refresh };
}
