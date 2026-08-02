"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import * as savedRepo from "@/features/calculators/repository";
import type { CalculatorType, SavedCalculation } from "@/types";

export function useSavedCalculations(filterType?: CalculatorType | "all") {
  const [items, setItems] = useState<SavedCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const next =
        filterType && filterType !== "all"
          ? await savedRepo.getSavedCalculationsByType(filterType)
          : await savedRepo.getSavedCalculations();
      setItems(next);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load saved calculations",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rename = useCallback(
    async (id: string, name: string) => {
      await savedRepo.updateSavedCalculation(id, { name });
      await refresh();
      toast.success("Name updated");
    },
    [refresh],
  );

  const duplicate = useCallback(
    async (id: string) => {
      await savedRepo.duplicateSavedCalculation(id);
      await refresh();
      toast.success("Calculation duplicated");
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await savedRepo.deleteSavedCalculation(id);
      await refresh();
      toast.success("Calculation deleted");
    },
    [refresh],
  );

  const run = useCallback((action: () => Promise<unknown>) => {
    startTransition(() => {
      void action().catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      });
    });
  }, []);

  return {
    items,
    isLoading,
    isPending,
    refresh,
    rename,
    duplicate,
    remove,
    run,
  };
}
