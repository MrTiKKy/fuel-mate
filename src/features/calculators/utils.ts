/** Pure calculator math — no UI side effects. */

import { parseLocaleNumber } from "@/lib/numbers";

export function parsePositive(value: string): number | null {
  if (value.trim() === "") return null;
  const n = parseLocaleNumber(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parsePositiveRequired(value: string): number | null {
  const n = parsePositive(value);
  if (n === null || n === 0) return null;
  return n;
}

export function calcFuelCost(input: {
  distance: number;
  consumption: number;
  fuelPrice: number;
}) {
  const fuelNeeded = (input.distance * input.consumption) / 100;
  const tripCost = fuelNeeded * input.fuelPrice;
  const costPerKm = input.distance > 0 ? tripCost / input.distance : 0;
  return { fuelNeeded, tripCost, costPerKm };
}

export function calcTripSplit(input: {
  tripCost: number;
  passengers: number;
  weights?: number[];
}) {
  const equalShare =
    input.passengers > 0 ? input.tripCost / input.passengers : 0;

  if (!input.weights || input.weights.length !== input.passengers) {
    return {
      costPerPerson: equalShare,
      shares: Array.from({ length: input.passengers }, () => equalShare),
      isCustom: false,
    };
  }

  const totalWeight = input.weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) {
    return {
      costPerPerson: equalShare,
      shares: Array.from({ length: input.passengers }, () => equalShare),
      isCustom: false,
    };
  }

  const shares = input.weights.map(
    (weight) => (input.tripCost * weight) / totalWeight,
  );

  return {
    costPerPerson: equalShare,
    shares,
    isCustom: true,
  };
}

export function calcAnnualFuel(input: {
  distancePerYear: number;
  consumption: number;
  fuelPrice: number;
}) {
  const fuelNeeded = (input.distancePerYear * input.consumption) / 100;
  const yearlyCost = fuelNeeded * input.fuelPrice;
  const monthlyCost = yearlyCost / 12;
  return { fuelNeeded, yearlyCost, monthlyCost };
}

export function calcFuelNeeded(input: {
  distance: number;
  consumption: number;
}) {
  return {
    litersNeeded: (input.distance * input.consumption) / 100,
  };
}

export function calcTankFill(input: {
  tankCapacity: number;
  currentFuelPercent: number;
  fuelPrice: number;
}) {
  const clamped = Math.min(100, Math.max(0, input.currentFuelPercent));
  const litersToFill = input.tankCapacity * (1 - clamped / 100);
  const totalCost = litersToFill * input.fuelPrice;
  return { litersToFill, totalCost, fillPercent: 100 - clamped };
}

export function calcCostPerKm(input: {
  consumption: number;
  fuelPrice: number;
}) {
  const costPer100Km = input.consumption * input.fuelPrice;
  const costPerKm = costPer100Km / 100;
  return { costPerKm, costPer100Km };
}

export function calcMaintenance(input: {
  fuel: number;
  insurance: number;
  maintenance: number;
  roadTax: number;
  other: number;
  yearlyDistance?: number;
}) {
  const monthlyTotal =
    input.fuel +
    input.insurance +
    input.maintenance +
    input.roadTax +
    input.other;
  const yearlyTotal = monthlyTotal * 12;
  const costPerKm =
    input.yearlyDistance && input.yearlyDistance > 0
      ? yearlyTotal / input.yearlyDistance
      : null;
  return { monthlyTotal, yearlyTotal, costPerKm };
}

export function formatCalcNumber(
  value: number,
  fractionDigits = 2,
  locale = "en-US",
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCalcCurrency(
  value: number,
  currency = "RON",
  locale = "ro-RO",
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildResultsClipboard(
  title: string,
  rows: { label: string; value: string }[],
): string {
  return [`${title}`, ...rows.map((row) => `${row.label}: ${row.value}`)].join(
    "\n",
  );
}
