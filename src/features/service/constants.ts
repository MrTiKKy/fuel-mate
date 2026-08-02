import type { ServiceType } from "@/types";

export const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "oil_change", label: "Oil Change" },
  { value: "oil_filter", label: "Oil Filter" },
  { value: "air_filter", label: "Air Filter" },
  { value: "cabin_filter", label: "Cabin Filter" },
  { value: "fuel_filter", label: "Fuel Filter" },
  { value: "spark_plugs", label: "Spark Plugs" },
  { value: "timing_belt", label: "Timing Belt" },
  { value: "timing_chain", label: "Timing Chain" },
  { value: "brake_pads", label: "Brake Pads" },
  { value: "brake_discs", label: "Brake Discs" },
  { value: "brake_fluid", label: "Brake Fluid" },
  { value: "coolant", label: "Coolant" },
  { value: "transmission_oil", label: "Transmission Oil" },
  { value: "battery", label: "Battery" },
  { value: "tyres", label: "Tyres" },
  { value: "wheel_alignment", label: "Wheel Alignment" },
  { value: "itp", label: "ITP" },
  { value: "insurance", label: "Insurance" },
  { value: "road_tax", label: "Road Tax" },
  { value: "other", label: "Other" },
];

export const SERVICE_TYPE_LABELS = Object.fromEntries(
  SERVICE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ServiceType, string>;

export const UPCOMING_DAY_THRESHOLD = 30;
export const UPCOMING_KM_THRESHOLD = 1000;
