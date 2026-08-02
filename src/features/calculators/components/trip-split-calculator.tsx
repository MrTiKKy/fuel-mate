"use client";

import { useMemo } from "react";
import { FloatingField } from "@/components/shared/floating-field";
import { CalculatorShell } from "@/features/calculators/components/calculator-shell";
import { useCalculatorFields } from "@/features/calculators/hooks/use-calculator-fields";
import {
  calcTripSplit,
  formatCalcCurrency,
  parsePositive,
  parsePositiveRequired,
} from "@/features/calculators/utils";

const INITIAL = {
  tripCost: "",
  passengers: "2",
  customWeights: "",
};

export function TripSplitCalculator() {
  const { values, setField, reset, hasInput } = useCalculatorFields(INITIAL);

  const results = useMemo(() => {
    const tripCost = parsePositive(values.tripCost);
    const passengers = parsePositiveRequired(values.passengers);

    if (
      tripCost === null ||
      passengers === null ||
      !Number.isInteger(passengers) ||
      passengers > 20
    ) {
      return [
        { label: "Cost per person", value: "—", emphasize: true },
        { label: "Split mode", value: "—" },
      ];
    }

    const weights = values.customWeights
      .split(/[, ]+/)
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0);

    const calc = calcTripSplit({
      tripCost,
      passengers,
      weights: weights.length === passengers ? weights : undefined,
    });

    const rows = [
      {
        label: "Cost per person",
        value: formatCalcCurrency(calc.costPerPerson),
        emphasize: true,
      },
      {
        label: "Split mode",
        value: calc.isCustom ? "Custom weights" : "Equal split",
      },
    ];

    if (calc.isCustom) {
      calc.shares.forEach((share, index) => {
        rows.push({
          label: `Person ${index + 1}`,
          value: formatCalcCurrency(share),
          emphasize: false,
        });
      });
    }

    return rows;
  }, [values]);

  return (
    <CalculatorShell
      title="Trip cost split"
      subtitle="Share costs fairly"
      results={results}
      onReset={reset}
      canReset={hasInput}
      clipboardTitle="Trip cost split"
    >
      <FloatingField
        label="Trip cost"
        value={values.tripCost}
        onChange={(value) => setField("tripCost", value)}
        min={0}
      />
      <FloatingField
        label="Passengers"
        value={values.passengers}
        onChange={(value) => setField("passengers", value)}
        inputMode="numeric"
        step={1}
        min={1}
        max={20}
      />
      <FloatingField
        label="Custom split weights"
        value={values.customWeights}
        onChange={(value) => setField("customWeights", value)}
        type="text"
        inputMode="text"
        placeholder=" "
      />
      <p className="px-1 text-xs text-muted-foreground">
        Optional: enter one weight per passenger, comma-separated (e.g. 1, 1,
        2). Leave empty for an equal split.
      </p>
    </CalculatorShell>
  );
}
