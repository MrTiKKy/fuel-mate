import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  Cylinder,
  Droplets,
  Fuel,
  Gauge,
  PiggyBank,
  Route,
  Wrench,
} from "lucide-react";
import type { CalculatorType } from "@/types";

export type CalculatorId = CalculatorType;

export type CalculatorMeta = {
  id: CalculatorId;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function getCalculatorMeta(id: CalculatorId): CalculatorMeta | undefined {
  return CALCULATORS.find((item) => item.id === id);
}

export function getCalculatorHref(id: CalculatorId, savedId?: string): string {
  const meta = getCalculatorMeta(id);
  const base = meta?.href ?? "/calculators";
  if (!savedId) return base;
  return `${base}?saved=${encodeURIComponent(savedId)}`;
}

export const CALCULATORS: CalculatorMeta[] = [
  {
    id: "fuel-cost",
    title: "Fuel cost",
    description: "Fuel needed, trip cost, and cost per km",
    href: "/calculators/fuel",
    icon: Fuel,
  },
  {
    id: "trip-split",
    title: "Trip cost split",
    description: "Split trip costs between passengers",
    href: "/calculators/trip",
    icon: Route,
  },
  {
    id: "annual-fuel",
    title: "Annual fuel cost",
    description: "Monthly and yearly fuel projections",
    href: "/calculators/annual",
    icon: PiggyBank,
  },
  {
    id: "fuel-needed",
    title: "Fuel needed",
    description: "Liters required for a distance",
    href: "/calculators/fuel-needed",
    icon: Droplets,
  },
  {
    id: "tank-fill",
    title: "Tank fill",
    description: "Liters and cost to top up",
    href: "/calculators/tank-fill",
    icon: Cylinder,
  },
  {
    id: "cost-per-km",
    title: "Cost per kilometer",
    description: "Running cost from consumption",
    href: "/calculators/cost-per-km",
    icon: Gauge,
  },
  {
    id: "maintenance",
    title: "Maintenance cost",
    description: "Ownership costs and cost per km",
    href: "/calculators/maintenance",
    icon: Wrench,
  },
];

export const CALCULATORS_HUB_HINT =
  "All calculators run on-device — instant, private, offline.";

export { Calculator as CalculatorsIcon };
