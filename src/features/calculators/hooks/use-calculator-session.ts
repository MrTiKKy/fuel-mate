"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCalculatorFields } from "@/features/calculators/hooks/use-calculator-fields";
import * as savedRepo from "@/features/calculators/repository";
import type { CalculatorId } from "@/features/calculators/constants";

function readSavedIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("saved");
}

/**
 * Calculator field state with optional restore from a saved calculation (?saved=id).
 */
export function useCalculatorSession<T extends Record<string, string>>(
  calculatorType: CalculatorId,
  initial: T,
) {
  const fields = useCalculatorFields(initial);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [activeSavedName, setActiveSavedName] = useState<string | null>(null);
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    const savedId = readSavedIdFromUrl();
    if (!savedId || loadedRef.current === savedId) return;
    loadedRef.current = savedId;

    void savedRepo.getSavedCalculation(savedId).then((saved) => {
      if (!saved || saved.calculatorType !== calculatorType) return;
      fields.setValues({ ...initial, ...saved.inputs } as T);
      setActiveSavedId(saved.id);
      setActiveSavedName(saved.name);
    });
    // Load once when mounting / restoring a saved calculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatorType]);

  const markSaved = useCallback((id: string, name: string) => {
    setActiveSavedId(id);
    setActiveSavedName(name);
  }, []);

  const clearSaved = useCallback(() => {
    setActiveSavedId(null);
    setActiveSavedName(null);
  }, []);

  const reset = useCallback(() => {
    fields.reset();
    clearSaved();
  }, [fields, clearSaved]);

  return {
    ...fields,
    reset,
    activeSavedId,
    activeSavedName,
    markSaved,
    clearSaved,
  };
}
