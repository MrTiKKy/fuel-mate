"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorFields } from "@/features/calculators/hooks/use-calculator-fields";
import {
  calcCostPerKm,
  formatCalcCurrency,
  parsePositive,
  parsePositiveRequired,
} from "@/features/calculators/utils";

const INITIAL = {
  consumption: "",
  fuelPrice: "",
};

export function CostPerKmCalculator() {
  const { values, setField, reset, hasInput } = useCalculatorFields(INITIAL);

  const results = useMemo(() => {
    const consumption = parsePositiveRequired(values.consumption);
    const fuelPrice = parsePositive(values.fuelPrice);

    if (consumption === null || fuelPrice === null) {
      return [
        { label: "Cost per km", value: "—", emphasize: true },
        { label: "Cost per 100 km", value: "—" },
      ];
    }

    const calc = calcCostPerKm({ consumption, fuelPrice });
    return [
      {
        label: "Cost per km",
        value: formatCalcCurrency(calc.costPerKm),
        emphasize: true,
      },
      {
        label: "Cost per 100 km",
        value: formatCalcCurrency(calc.costPer100Km),
      },
    ];
  }, [values]);

  return (
    <CalculatorShell
      title="Cost per kilometer"
      subtitle="Running cost from consumption"
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Cost per kilometer"
    >
      <FloatingField
        label="Consumption"
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
