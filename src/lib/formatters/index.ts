/**
 * Formatting helpers — currency defaults to RON for first install / Romania-first UX.
 */

export function formatCurrency(
  value: number,
  currency = "RON",
  locale = "ro-RO",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  locale = "ro-RO",
  fractionDigits = 1,
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDistance(value: number, unit: "km" | "mi" = "km"): string {
  return `${formatNumber(value, "ro-RO", 0)} ${unit}`;
}

export function formatVolume(value: number, unit: "L" | "gal" = "L"): string {
  return `${formatNumber(value, "ro-RO", 2)} ${unit}`;
}
