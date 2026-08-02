import {
  BarChart3,
  Calculator,
  Car,
  Fuel,
  Home,
  Settings,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    description: "Dashboard overview",
  },
  {
    title: "Cars",
    href: "/cars",
    icon: Car,
    description: "Manage your vehicles",
  },
  {
    title: "Fuel",
    href: "/fuel",
    icon: Fuel,
    description: "Fuel log and history",
  },
  {
    title: "Stats",
    href: "/statistics",
    icon: BarChart3,
    description: "Insights and charts",
  },
  {
    title: "More",
    href: "/more",
    icon: Settings,
    description: "Tools and settings",
  },
];

export const MORE_MENU_ITEMS: NavItem[] = [
  {
    title: "Calculators",
    href: "/calculators",
    icon: Calculator,
    description: "Fuel, trip, ownership, and tank tools",
  },
  {
    title: "Service",
    href: "/service",
    icon: Wrench,
    description: "Maintenance tracker",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences and backup",
  },
];

export const APP_NAME = "Car Companion";
export const APP_DESCRIPTION =
  "Your offline-first car management companion for fuel, costs, and maintenance.";
export const APP_VERSION = "1.0.0";
