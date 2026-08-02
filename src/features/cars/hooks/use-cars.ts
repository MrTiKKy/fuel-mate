"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Car, CreateCarInput, UpdateCarInput } from "@/types";
import * as carsRepo from "@/features/cars/repository";
import { duplicateCarInput } from "@/features/cars/utils";

type CarsState = {
  cars: Car[];
  activeCarId?: string;
  isLoading: boolean;
  error: string | null;
};

export function useCars() {
  const [state, setState] = useState<CarsState>({
    cars: [],
    activeCarId: undefined,
    isLoading: true,
    error: null,
  });
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    try {
      const [cars, activeCarId] = await Promise.all([
        carsRepo.getCars(),
        carsRepo.getActiveCarId(),
      ]);
      setState({
        cars,
        activeCarId,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load vehicles";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createCar = useCallback(
    async (input: CreateCarInput) => {
      const car = await carsRepo.createCar(input);
      await refresh();
      toast.success("Vehicle added");
      return car;
    },
    [refresh],
  );

  const updateCar = useCallback(
    async (id: string, input: UpdateCarInput) => {
      const car = await carsRepo.updateCar(id, input);
      await refresh();
      toast.success("Vehicle updated");
      return car;
    },
    [refresh],
  );

  const deleteCar = useCallback(
    async (id: string) => {
      await carsRepo.deleteCar(id);
      await refresh();
      toast.success("Vehicle deleted");
    },
    [refresh],
  );

  const setActiveCar = useCallback(
    async (id: string) => {
      await carsRepo.setActiveCar(id);
      await refresh();
      toast.success("Active vehicle updated");
    },
    [refresh],
  );

  const duplicateCar = useCallback(
    async (car: Car) => {
      const created = await carsRepo.createCar(duplicateCarInput(car));
      await refresh();
      toast.success("Vehicle duplicated");
      return created;
    },
    [refresh],
  );

  const run = useCallback(
    (action: () => Promise<unknown>) => {
      startTransition(() => {
        void action().catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Something went wrong";
          toast.error(message);
        });
      });
    },
    [],
  );

  return {
    ...state,
    isPending,
    refresh,
    createCar,
    updateCar,
    deleteCar,
    setActiveCar,
    duplicateCar,
    run,
  };
}
