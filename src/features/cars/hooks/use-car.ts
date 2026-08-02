"use client";

import { useCallback, useEffect, useState } from "react";
import type { Car } from "@/types";
import * as carsRepo from "@/features/cars/repository";

export function useCar(id: string) {
  const [car, setCar] = useState<Car | null>(null);
  const [activeCarId, setActiveCarId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [found, activeId] = await Promise.all([
        carsRepo.getCar(id),
        carsRepo.getActiveCarId(),
      ]);

      if (!found) {
        setCar(null);
        setNotFound(true);
      } else {
        setCar(found);
        setNotFound(false);
      }
      setActiveCarId(activeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicle");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    car,
    activeCarId,
    isActive: Boolean(car && activeCarId === car.id),
    isLoading,
    error,
    notFound,
    refresh,
  };
}
