import {
  BarChart3,
  Calculator,
  Car,
  FileText,
  Fuel,
  Home,
  Lightbulb,
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
    title: "Documents",
    href: "/documents",
    icon: FileText,
    description: "Insurance, ITP, licenses and more",
  },
  {
    title: "Insights",
    href: "/insights",
    icon: Lightbulb,
    description: "Personalized vehicle insights",
  },
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

export const APP_NAME = "Garage+";
export const APP_SHORT_NAME = "Garage+";
export const APP_DESCRIPTION =
  "Your offline-first digital garage for vehicles, fuel, documents, service, and insights.";
export const APP_VERSION = "1.2.0";
