"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorSession } from "@/features/calculators/hooks/use-calculator-session";
import {
  calcFuelNeeded,
  formatCalcNumber,
  parsePositiveRequired,
} from "@/features/calculators/utils";

const INITIAL = {
  distance: "",
  consumption: "",
};

export function FuelNeededCalculator() {
  const {
    values,
    setField,
    reset,
    hasInput,
    activeSavedId,
    activeSavedName,
    markSaved,
  } = useCalculatorSession("fuel-needed", INITIAL);

  const results = useMemo(() => {
    const distance = parsePositiveRequired(values.distance);
    const consumption = parsePositiveRequired(values.consumption);

    if (distance === null || consumption === null) {
      return [{ label: "Liters needed", value: "—", emphasize: true }];
    }

    const calc = calcFuelNeeded({ distance, consumption });
    return [
      {
        label: "Liters needed",
        value: `${formatCalcNumber(calc.litersNeeded)} L`,
        emphasize: true,
      },
    ];
  }, [values]);

  return (
    <CalculatorShell
      title="Fuel needed"
      subtitle="How much fuel for the trip"
      calculatorType="fuel-needed"
      inputs={values}
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Fuel needed"
      activeSavedId={activeSavedId}
      activeSavedName={activeSavedName}
      onSaved={markSaved}
    >
      <FloatingField
        label="Distance"
        suffix="km"
        value={values.distance}
        onChange={(value) => setField("distance", value)}
        min={0}
      />
      <FloatingField
        label="Consumption"
        suffix="L/100km"
        value={values.consumption}
        onChange={(value) => setField("consumption", value)}
        min={0}
      />
    </CalculatorShell>
  );
}
