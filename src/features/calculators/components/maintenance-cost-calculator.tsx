"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorFields } from "@/features/calculators/hooks/use-calculator-fields";
import {
  calcMaintenance,
  formatCalcCurrency,
  parsePositive,
} from "@/features/calculators/utils";

const INITIAL = {
  fuel: "",
  insurance: "",
  maintenance: "",
  roadTax: "",
  other: "",
  yearlyDistance: "",
};

export function MaintenanceCostCalculator() {
  const { values, setField, reset, hasInput } = useCalculatorFields(INITIAL);

  const results = useMemo(() => {
    const fuel = parsePositive(values.fuel) ?? 0;
    const insurance = parsePositive(values.insurance) ?? 0;
    const maintenance = parsePositive(values.maintenance) ?? 0;
    const roadTax = parsePositive(values.roadTax) ?? 0;
    const other = parsePositive(values.other) ?? 0;
    const yearlyDistance = parsePositive(values.yearlyDistance) ?? undefined;

    if (!hasInput) {
      return [
        { label: "Monthly total", value: "—" },
        { label: "Yearly total", value: "—", emphasize: true },
        { label: "Cost per km", value: "—" },
      ];
    }

    const calc = calcMaintenance({
      fuel,
      insurance,
      maintenance,
      roadTax,
      other,
      yearlyDistance,
    });

    return [
      {
        label: "Monthly total",
        value: formatCalcCurrency(calc.monthlyTotal),
      },
      {
        label: "Yearly total",
        value: formatCalcCurrency(calc.yearlyTotal),
        emphasize: true,
      },
      {
        label: "Cost per km",
        value:
          calc.costPerKm == null
            ? "Add yearly distance"
            : formatCalcCurrency(calc.costPerKm),
      },
    ];
  }, [values, hasInput]);

  return (
    <CalculatorShell
      title="Maintenance cost"
      subtitle="Monthly ownership spend"
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Maintenance cost"
    >
      <FloatingField
        label="Fuel (monthly)"
        value={values.fuel}
        onChange={(value) => setField("fuel", value)}
        min={0}
      />
      <FloatingField
        label="Insurance (monthly)"
        value={values.insurance}
        onChange={(value) => setField("insurance", value)}
        min={0}
      />
      <FloatingField
        label="Maintenance (monthly)"
        value={values.maintenance}
        onChange={(value) => setField("maintenance", value)}
        min={0}
      />
      <FloatingField
        label="Road tax (monthly)"
        value={values.roadTax}
        onChange={(value) => setField("roadTax", value)}
        min={0}
      />
      <FloatingField
        label="Other (monthly)"
        value={values.other}
        onChange={(value) => setField("other", value)}
        min={0}
      />
      <FloatingField
        label="Yearly distance (optional)"
        suffix="km"
        value={values.yearlyDistance}
        onChange={(value) => setField("yearlyDistance", value)}
        min={0}
      />
    </CalculatorShell>
  );
}
