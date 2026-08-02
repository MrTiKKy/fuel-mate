/**
 * Formatting helpers — ready for currency, distance, and volume display.
 */

export function formatCurrency(
  value: number,
  currency = "EUR",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  locale = "en-US",
  fractionDigits = 1,
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDistance(value: number, unit: "km" | "mi" = "km"): string {
  return `${formatNumber(value, "en-US", 0)} ${unit}`;
}

export function formatVolume(value: number, unit: "L" | "gal" = "L"): string {
  return `${formatNumber(value, "en-US", 2)} ${unit}`;
}
