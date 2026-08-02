"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  Car,
  CreateFuelEntryInput,
  FuelEntry,
  FuelStats,
  UpdateFuelEntryInput,
} from "@/types";
import * as fuelRepo from "@/features/fuel/repository";
import * as carsRepo from "@/features/cars/repository";
import {
  computeFuelStats,
  duplicateFuelEntryInput,
  EMPTY_FUEL_STATS,
} from "@/features/fuel/utils";

type FuelState = {
  entries: FuelEntry[];
  cars: Car[];
  selectedCarId?: string;
  stats: FuelStats;
  isLoading: boolean;
  error: string | null;
};

export function useFuelEntries() {
  const [state, setState] = useState<FuelState>({
    entries: [],
    cars: [],
    selectedCarId: undefined,
    stats: EMPTY_FUEL_STATS,
    isLoading: true,
    error: null,
  });
  const selectedCarIdRef = useRef<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async (carId?: string) => {
    try {
      const [cars, activeCarId] = await Promise.all([
        carsRepo.getCars(),
        carsRepo.getActiveCarId(),
      ]);

      const selected =
        carId ?? selectedCarIdRef.current ?? activeCarId ?? cars[0]?.id;

      selectedCarIdRef.current = selected;

      const entries = selected
        ? await fuelRepo.getFuelEntriesByCar(selected)
        : [];

      setState({
        entries,
        cars,
        selectedCarId: selected,
        stats: computeFuelStats(entries),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load fuel log";
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

  const selectCar = useCallback(
    async (nextCarId: string) => {
      selectedCarIdRef.current = nextCarId;
      setState((prev) => ({
        ...prev,
        selectedCarId: nextCarId,
        isLoading: true,
      }));
      await refresh(nextCarId);
    },
    [refresh],
  );

  const createEntry = useCallback(
    async (input: CreateFuelEntryInput) => {
      const entry = await fuelRepo.createFuelEntry(input);
      selectedCarIdRef.current = input.carId;
      await refresh(input.carId);
      toast.success("Fuel entry added");
      return entry;
    },
    [refresh],
  );

  const updateEntry = useCallback(
    async (id: string, input: UpdateFuelEntryInput) => {
      const entry = await fuelRepo.updateFuelEntry(id, input);
      await refresh(entry.carId);
      toast.success("Fuel entry updated");
      return entry;
    },
    [refresh],
  );

  const deleteEntry = useCallback(
    async (id: string, carId?: string) => {
      await fuelRepo.deleteFuelEntry(id);
      await refresh(carId ?? selectedCarIdRef.current);
      toast.success("Fuel entry deleted");
    },
    [refresh],
  );

  const duplicateEntry = useCallback(
    async (entry: FuelEntry) => {
      const created = await fuelRepo.createFuelEntry(
        duplicateFuelEntryInput(entry),
      );
      await refresh(entry.carId);
      toast.success("Fuel entry duplicated");
      return created;
    },
    [refresh],
  );

  const run = useCallback((action: () => Promise<unknown>) => {
    startTransition(() => {
      void action().catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
      });
    });
  }, []);

  return {
    ...state,
    isPending,
    refresh,
    selectCar,
    createEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    run,
  };
}
