/**
 * Locale-friendly number parsing for mobile keyboards.
 * Accepts both "5.5" and "5,5" (and thin spaces / apostrophe thousands).
 */

export function normalizeDecimalInput(raw: string): string {
  if (!raw) return "";
  let value = raw.trim().replace(/\s/g, "").replace(/'/g, "");

  const hasComma = value.includes(",");
  const hasDot = value.includes(".");

  if (hasComma && hasDot) {
    // Assume the last separator is the decimal mark
    const lastComma = value.lastIndexOf(",");
    const lastDot = value.lastIndexOf(".");
    if (lastComma > lastDot) {
      value = value.replace(/\./g, "").replace(",", ".");
    } else {
      value = value.replace(/,/g, "");
    }
  } else if (hasComma) {
    value = value.replace(",", ".");
  }

  return value;
}

export function parseLocaleNumber(raw: string): number {
  const normalized = normalizeDecimalInput(raw);
  if (normalized === "" || normalized === "-" || normalized === ".") {
    return Number.NaN;
  }
  return Number(normalized);
}

export function isValidPositiveNumber(raw: string): boolean {
  const n = parseLocaleNumber(raw);
  return Number.isFinite(n) && n > 0;
}

export function isValidNonNegativeNumber(raw: string): boolean {
  const n = parseLocaleNumber(raw);
  return Number.isFinite(n) && n >= 0;
}
