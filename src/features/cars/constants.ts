import type { FuelType, TransmissionType } from "@/types";

export const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "plugin_hybrid", label: "Plug-in Hybrid" },
  { value: "electric", label: "Electric" },
  { value: "lpg", label: "LPG" },
  { value: "cng", label: "CNG" },
];

export const TRANSMISSION_OPTIONS: {
  value: TransmissionType;
  label: string;
}[] = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "cvt", label: "CVT" },
  { value: "dct", label: "DCT" },
  { value: "other", label: "Other" },
];

export const FUEL_TYPE_LABELS: Record<FuelType, string> = Object.fromEntries(
  FUEL_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<FuelType, string>;

export const TRANSMISSION_LABELS: Record<TransmissionType, string> =
  Object.fromEntries(
    TRANSMISSION_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<TransmissionType, string>;

export const EMPTY_CAR_STATS = {
  totalFuelEntries: 0,
  totalDistance: 0,
  totalFuelCost: 0,
  averageConsumption: 0,
} as const;
