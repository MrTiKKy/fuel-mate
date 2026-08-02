"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorFields } from "@/features/calculators/hooks/use-calculator-fields";
import {
  calcAnnualFuel,
  formatCalcCurrency,
  formatCalcNumber,
  parsePositive,
  parsePositiveRequired,
} from "@/features/calculators/utils";

const INITIAL = {
  distancePerYear: "",
  consumption: "",
  fuelPrice: "",
};

export function AnnualFuelCalculator() {
  const { values, setField, reset, hasInput } = useCalculatorFields(INITIAL);

  const results = useMemo(() => {
    const distancePerYear = parsePositiveRequired(values.distancePerYear);
    const consumption = parsePositiveRequired(values.consumption);
    const fuelPrice = parsePositive(values.fuelPrice);

    if (
      distancePerYear === null ||
      consumption === null ||
      fuelPrice === null
    ) {
      return [
        { label: "Monthly cost", value: "—" },
        { label: "Yearly cost", value: "—", emphasize: true },
        { label: "Fuel needed", value: "—" },
      ];
    }

    const calc = calcAnnualFuel({
      distancePerYear,
      consumption,
      fuelPrice,
    });

    return [
      {
        label: "Monthly cost",
        value: formatCalcCurrency(calc.monthlyCost),
      },
      {
        label: "Yearly cost",
        value: formatCalcCurrency(calc.yearlyCost),
        emphasize: true,
      },
      {
        label: "Fuel needed",
        value: `${formatCalcNumber(calc.fuelNeeded, 0)} L / year`,
      },
    ];
  }, [values]);

  return (
    <CalculatorShell
      title="Annual fuel cost"
      subtitle="Project yearly fuel spend"
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Annual fuel cost"
    >
      <FloatingField
        label="Distance per year"
        suffix="km"
        value={values.distancePerYear}
        onChange={(value) => setField("distancePerYear", value)}
        min={0}
      />
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
