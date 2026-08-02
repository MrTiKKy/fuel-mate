import { z } from "zod";
import { fuelTypeSchema } from "@/lib/validations/car";
import {
  normalizeDecimalInput,
  parseLocaleNumber,
} from "@/lib/numbers";

export const fuelEntryFormSchema = z
  .object({
    carId: z.string().min(1, "Select a vehicle"),
    date: z.string().min(1, "Date is required"),
    distanceSinceLastRefuel: z
      .string()
      .min(1, "Distance since last refuel is required"),
    liters: z.string().min(1, "Fuel amount is required"),
    pricePerLiter: z.string(),
    totalCost: z.string(),
    fuelType: fuelTypeSchema,
    isFullTank: z.boolean(),
    notes: z.string().max(1000),
  })
  .superRefine((data, ctx) => {
    const distance = parseLocaleNumber(data.distanceSinceLastRefuel);
    const liters = parseLocaleNumber(data.liters);
    const price = parseLocaleNumber(data.pricePerLiter);
    const total = parseLocaleNumber(data.totalCost);

    if (!Number.isFinite(distance) || distance <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter distance driven since last refuel",
        path: ["distanceSinceLastRefuel"],
      });
    }

    if (!Number.isFinite(liters) || liters <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fuel amount must be greater than 0",
        path: ["liters"],
      });
    }

    const hasPrice =
      data.pricePerLiter.trim() !== "" && Number.isFinite(price);
    const hasTotal = data.totalCost.trim() !== "" && Number.isFinite(total);

    if (!hasPrice && !hasTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter price per liter or total cost",
        path: ["pricePerLiter"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter price per liter or total cost",
        path: ["totalCost"],
      });
    }

    if (hasPrice && price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be greater than 0",
        path: ["pricePerLiter"],
      });
    }

    if (hasTotal && total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total cost must be greater than 0",
        path: ["totalCost"],
      });
    }
  });

export type FuelEntryFormValues = z.infer<typeof fuelEntryFormSchema>;

export type FuelEntryFormParsed = {
  carId: string;
  date: string;
  distanceSinceLastRefuel: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  fuelType: z.infer<typeof fuelTypeSchema>;
  isFullTank: boolean;
  notes?: string;
};

export function parseFuelEntryFormValues(
  values: FuelEntryFormValues,
): FuelEntryFormParsed {
  const liters = parseLocaleNumber(values.liters);
  let pricePerLiter = parseLocaleNumber(values.pricePerLiter);
  let totalCost = parseLocaleNumber(values.totalCost);

  const hasPrice =
    values.pricePerLiter.trim() !== "" && Number.isFinite(pricePerLiter);
  const hasTotal =
    values.totalCost.trim() !== "" && Number.isFinite(totalCost);

  if (hasPrice && !hasTotal) {
    totalCost = roundMoney(liters * pricePerLiter);
  } else if (hasTotal && !hasPrice) {
    pricePerLiter = liters > 0 ? roundPrice(totalCost / liters) : 0;
  } else if (hasPrice && hasTotal) {
    totalCost = roundMoney(totalCost);
    pricePerLiter = roundPrice(pricePerLiter);
  }

  const notes = values.notes.trim();

  return {
    carId: values.carId,
    date: values.date,
    distanceSinceLastRefuel: parseLocaleNumber(values.distanceSinceLastRefuel),
    liters,
    pricePerLiter,
    totalCost,
    fuelType: values.fuelType,
    isFullTank: values.isFullTank,
    notes: notes || undefined,
  };
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function roundPrice(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function roundConsumption(value: number) {
  return Math.round(value * 100) / 100;
}

/** Normalize field value as the user types (keep comma visually OK until blur). */
export function sanitizeNumericFieldValue(raw: string): string {
  return normalizeDecimalInput(raw);
}
