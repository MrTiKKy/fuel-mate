"use client";

import { useCallback, useMemo, useState } from "react";

export function useCalculatorFields<T extends Record<string, string>>(
  initial: T,
) {
  const [values, setValues] = useState<T>(initial);

  const setField = useCallback((key: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initial);
  }, [initial]);

  const hasInput = useMemo(
    () => Object.values(values).some((value) => String(value).trim() !== ""),
    [values],
  );

  return { values, setField, reset, hasInput, setValues };
}
