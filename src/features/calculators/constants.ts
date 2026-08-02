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

export type CalculatorId =
  | "fuel-cost"
  | "trip-split"
  | "annual-fuel"
  | "fuel-needed"
  | "tank-fill"
  | "cost-per-km"
  | "maintenance";

export type CalculatorMeta = {
  id: CalculatorId;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

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
