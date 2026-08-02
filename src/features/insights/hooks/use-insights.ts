"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrency } from "@/components/providers/app-settings-provider";
import * as carsRepo from "@/features/cars/repository";
import * as fuelRepo from "@/features/fuel/repository";
import * as serviceRepo from "@/features/service/repository";
import * as docsRepo from "@/features/documents/repository";
import { getInsights } from "@/features/insights/repository";
import type { InsightEngineResult } from "@/features/insights/engine/types";

const empty: InsightEngineResult = {
  unlock: {
    unlocked: false,
    fuelEntries: 0,
    expenses: 0,
    monthsOfData: 0,
    reason: "Keep using Garage+ to unlock personalized insights.",
  },
  insights: [],
  featured: null,
};

export function useInsights() {
  const currency = useCurrency();
  const [result, setResult] = useState<InsightEngineResult>(empty);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cars, fuelEntries, serviceRecords, documents] = await Promise.all([
        carsRepo.getCars(),
        fuelRepo.getFuelEntries(),
        serviceRepo.getServiceRecords(),
        docsRepo.getDocuments(),
      ]);

      const next = await getInsights({
        now: new Date(),
        currency,
        cars,
        fuelEntries,
        serviceRecords,
        documents,
      });
      setResult(next);
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, isLoading, refresh };
}
