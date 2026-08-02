export const APP_VERSION = "1.0.0";
export const BUILD_VERSION = "2026.08.02";
export const BACKUP_SCHEMA_VERSION = 2;
export const APP_NAME = "Car Companion";
export const APP_DEVELOPER = "Car Companion Team";
export const GITHUB_URL = "https://github.com/";
export const WEBSITE_URL = "https://example.com";

export const NOTIFICATION_OPTIONS = [
  {
    key: "serviceReminders",
    label: "Service reminders",
    description: "Upcoming and overdue maintenance",
  },
  {
    key: "oilReminders",
    label: "Oil reminders",
    description: "Oil change due dates and mileage",
  },
  {
    key: "insuranceReminders",
    label: "Insurance reminders",
    description: "Policy renewal dates",
  },
  {
    key: "itpReminders",
    label: "ITP reminders",
    description: "Inspection due dates",
  },
  {
    key: "fuelReminders",
    label: "Fuel reminders",
    description: "Low tank and fill-up tips",
  },
] as const;

export const CURRENCY_OPTIONS = [
  { value: "RON", label: "RON" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
] as const;

export const DISTANCE_OPTIONS = [
  { value: "km", label: "Kilometers" },
  { value: "mi", label: "Miles" },
] as const;

export const VOLUME_OPTIONS = [
  { value: "L", label: "Liters" },
  { value: "gal", label: "Gallons" },
] as const;

export const CONSUMPTION_OPTIONS = [
  { value: "l_100km", label: "L/100km" },
  { value: "mpg_uk", label: "MPG (UK)" },
  { value: "mpg_us", label: "MPG (US)" },
] as const;

export const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
] as const;

export const ACCENT_OPTIONS = [
  { value: "teal", label: "Teal", hint: "Default" },
  { value: "blue", label: "Blue", hint: "Coming soon" },
  { value: "green", label: "Green", hint: "Coming soon" },
  { value: "orange", label: "Orange", hint: "Coming soon" },
] as const;
