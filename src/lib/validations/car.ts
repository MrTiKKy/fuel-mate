import { z } from "zod";
import { parseLocaleNumber } from "@/lib/numbers";

const currentYear = new Date().getFullYear();

export const fuelTypeSchema = z.enum([
  "petrol",
  "diesel",
  "hybrid",
  "plugin_hybrid",
  "electric",
  "lpg",
  "cng",
]);

export const transmissionSchema = z.enum([
  "manual",
  "automatic",
  "cvt",
  "dct",
  "other",
]);

function parseOptionalNumber(
  value: string | undefined,
  field: string,
  ctx: z.RefinementCtx,
  rules: {
    min?: number;
    max?: number;
    exclusiveMin?: number;
    integer?: boolean;
    message?: string;
  },
): number | undefined {
  const raw = value?.trim() ?? "";
  if (!raw) return undefined;

  const num = parseLocaleNumber(raw);
  if (!Number.isFinite(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must be a valid number",
      path: [field],
    });
    return undefined;
  }

  if (rules.integer && !Number.isInteger(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must be a whole number",
      path: [field],
    });
    return undefined;
  }

  if (rules.min !== undefined && num < rules.min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: rules.message ?? `Must be at least ${rules.min}`,
      path: [field],
    });
    return undefined;
  }

  if (rules.exclusiveMin !== undefined && num <= rules.exclusiveMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: rules.message ?? `Must be greater than ${rules.exclusiveMin}`,
      path: [field],
    });
    return undefined;
  }

  if (rules.max !== undefined && num > rules.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: rules.message ?? `Must be at most ${rules.max}`,
      path: [field],
    });
    return undefined;
  }

  return num;
}

export const carFormSchema = z
  .object({
    name: z.string().max(60, "Name is too long"),
    brand: z
      .string()
      .trim()
      .min(1, "Brand is required")
      .max(40, "Brand is too long"),
    model: z
      .string()
      .trim()
      .min(1, "Model is required")
      .max(40, "Model is too long"),
    year: z.string(),
    engine: z.string().max(60),
    fuelType: fuelTypeSchema,
    transmission: z.union([transmissionSchema, z.literal("")]),
    horsepower: z.string(),
    tankCapacity: z.string(),
    averageConsumption: z.string(),
    licensePlate: z.string().max(20),
    color: z.string().max(30),
    purchaseDate: z.string(),
    notes: z.string().max(1000),
  })
  .superRefine((data, ctx) => {
    parseOptionalNumber(data.year, "year", ctx, {
      integer: true,
      min: 1950,
      max: currentYear + 1,
      message: `Year must be between 1950 and ${currentYear + 1}`,
    });
    parseOptionalNumber(data.horsepower, "horsepower", ctx, { min: 0 });
    parseOptionalNumber(data.tankCapacity, "tankCapacity", ctx, {
      exclusiveMin: 0,
      message: "Tank capacity must be greater than 0",
    });
    parseOptionalNumber(data.averageConsumption, "averageConsumption", ctx, {
      exclusiveMin: 0,
      message: "Consumption must be greater than 0",
    });
  });

export type CarFormValues = z.infer<typeof carFormSchema>;

/** Parsed numeric fields ready for persistence */
export type CarFormParsed = Omit<
  CarFormValues,
  "year" | "horsepower" | "tankCapacity" | "averageConsumption" | "transmission"
> & {
  year?: number;
  horsepower?: number;
  tankCapacity?: number;
  averageConsumption?: number;
  transmission?: z.infer<typeof transmissionSchema>;
};

export function parseCarFormValues(values: CarFormValues): CarFormParsed {
  const toNum = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const n = parseLocaleNumber(trimmed);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    name: values.name,
    brand: values.brand,
    model: values.model,
    engine: values.engine,
    fuelType: values.fuelType,
    licensePlate: values.licensePlate,
    color: values.color,
    purchaseDate: values.purchaseDate,
    notes: values.notes,
    year: toNum(values.year),
    horsepower: toNum(values.horsepower),
    tankCapacity: toNum(values.tankCapacity),
    averageConsumption: toNum(values.averageConsumption),
    transmission:
      values.transmission === "" ? undefined : values.transmission,
  };
}

export const currencySchema = z.enum([
  "USD",
  "EUR",
  "GBP",
  "RON",
  "PLN",
  "CZK",
]);

export const distanceUnitSchema = z.enum(["km", "mi"]);
export const volumeUnitSchema = z.enum(["L", "gal"]);
