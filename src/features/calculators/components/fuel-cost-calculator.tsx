"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorSession } from "@/features/calculators/hooks/use-calculator-session";
import {
  calcFuelCost,
  formatCalcCurrency,
  formatCalcNumber,
  parsePositive,
  parsePositiveRequired,
} from "@/features/calculators/utils";

const INITIAL = {
  distance: "",
  consumption: "",
  fuelPrice: "",
};

export function FuelCostCalculator() {
  const {
    values,
    setField,
    reset,
    hasInput,
    activeSavedId,
    activeSavedName,
    markSaved,
  } = useCalculatorSession("fuel-cost", INITIAL);

  const results = useMemo(() => {
    const distance = parsePositiveRequired(values.distance);
    const consumption = parsePositiveRequired(values.consumption);
    const fuelPrice = parsePositive(values.fuelPrice);

    if (distance === null || consumption === null || fuelPrice === null) {
      return [
        { label: "Fuel needed", value: "—" },
        { label: "Trip cost", value: "—", emphasize: true },
        { label: "Cost per kilometer", value: "—" },
      ];
    }

    const calc = calcFuelCost({ distance, consumption, fuelPrice });
    return [
      {
        label: "Fuel needed",
        value: `${formatCalcNumber(calc.fuelNeeded)} L`,
      },
      {
        label: "Trip cost",
        value: formatCalcCurrency(calc.tripCost),
        emphasize: true,
      },
      {
        label: "Cost per kilometer",
        value: formatCalcCurrency(calc.costPerKm),
      },
    ];
  }, [values]);

  return (
    <CalculatorShell
      title="Fuel cost"
      subtitle="Estimate fuel and trip cost"
      calculatorType="fuel-cost"
      inputs={values}
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Fuel cost calculator"
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
        label="Average consumption"
        suffix="L/100km"
        value={values.consumption}
        onChange={(value) => setField("consumption", value)}
        min={0}
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
