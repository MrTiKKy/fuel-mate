"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorSession } from "@/features/calculators/hooks/use-calculator-session";
import {
  calcTankFill,
  formatCalcCurrency,
  formatCalcNumber,
  parsePositive,
  parsePositiveRequired,
} from "@/features/calculators/utils";

const INITIAL = {
  tankCapacity: "",
  currentFuelPercent: "",
  fuelPrice: "",
};

export function TankFillCalculator() {
  const {
    values,
    setField,
    reset,
    hasInput,
    activeSavedId,
    activeSavedName,
    markSaved,
  } = useCalculatorSession("tank-fill", INITIAL);

  const results = useMemo(() => {
    const tankCapacity = parsePositiveRequired(values.tankCapacity);
    const currentFuelPercent = parsePositive(values.currentFuelPercent);
    const fuelPrice = parsePositive(values.fuelPrice);

    if (
      tankCapacity === null ||
      currentFuelPercent === null ||
      fuelPrice === null ||
      currentFuelPercent > 100
    ) {
      return [
        { label: "Liters to fill", value: "—" },
        { label: "Total cost", value: "—", emphasize: true },
      ];
    }

    const calc = calcTankFill({
      tankCapacity,
      currentFuelPercent,
      fuelPrice,
    });

    return [
      {
        label: "Liters to fill",
        value: `${formatCalcNumber(calc.litersToFill)} L`,
      },
      {
        label: "Total cost",
        value: formatCalcCurrency(calc.totalCost),
        emphasize: true,
      },
    ];
  }, [values]);

  return (
    <CalculatorShell
      title="Tank fill"
      subtitle="Top-up volume and cost"
      calculatorType="tank-fill"
      inputs={values}
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Tank fill"
      activeSavedId={activeSavedId}
      activeSavedName={activeSavedName}
      onSaved={markSaved}
    >
      <FloatingField
        label="Tank capacity"
        suffix="L"
        value={values.tankCapacity}
        onChange={(value) => setField("tankCapacity", value)}
        min={0}
      />
      <FloatingField
        label="Current fuel"
        suffix="%"
        value={values.currentFuelPercent}
        onChange={(value) => setField("currentFuelPercent", value)}
        min={0}
        max={100}
      />
      <FloatingField
        label="Fuel price"
        suffix="/L"
        value={values.fuelPrice}
        onChange={(value) => setField("fuelPrice", value)}
        min={0}
      />
    </CalculatorShell>
  );
}
