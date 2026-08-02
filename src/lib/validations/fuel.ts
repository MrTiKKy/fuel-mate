import { z } from "zod";
import { fuelTypeSchema } from "@/lib/validations/car";

export const fuelEntryFormSchema = z
  .object({
    carId: z.string().min(1, "Select a vehicle"),
    date: z.string().min(1, "Date is required"),
    odometer: z.string().min(1, "Odometer is required"),
    liters: z.string().min(1, "Liters is required"),
    pricePerLiter: z.string(),
    totalCost: z.string(),
    fuelStation: z.string().max(80),
    fuelType: fuelTypeSchema,
    isFullTank: z.boolean(),
    notes: z.string().max(1000),
  })
  .superRefine((data, ctx) => {
    const odometer = Number(data.odometer);
    const liters = Number(data.liters);
    const price = Number(data.pricePerLiter);
    const total = Number(data.totalCost);

    if (Number.isNaN(odometer) || odometer < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid odometer reading",
        path: ["odometer"],
      });
    }

    if (Number.isNaN(liters) || liters <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Liters must be greater than 0",
        path: ["liters"],
      });
    }

    const hasPrice = data.pricePerLiter.trim() !== "" && !Number.isNaN(price);
    const hasTotal = data.totalCost.trim() !== "" && !Number.isNaN(total);

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
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  fuelStation?: string;
  fuelType: z.infer<typeof fuelTypeSchema>;
  isFullTank: boolean;
  notes?: string;
};

export function parseFuelEntryFormValues(
  values: FuelEntryFormValues,
): FuelEntryFormParsed {
  const liters = Number(values.liters);
  let pricePerLiter = Number(values.pricePerLiter);
  let totalCost = Number(values.totalCost);

  const hasPrice = values.pricePerLiter.trim() !== "" && !Number.isNaN(pricePerLiter);
  const hasTotal = values.totalCost.trim() !== "" && !Number.isNaN(totalCost);

  if (hasPrice && !hasTotal) {
    totalCost = roundMoney(liters * pricePerLiter);
  } else if (hasTotal && !hasPrice) {
    pricePerLiter = liters > 0 ? roundPrice(totalCost / liters) : 0;
  } else if (hasPrice && hasTotal) {
    // Prefer explicit total when both provided; keep price as entered
    totalCost = roundMoney(totalCost);
    pricePerLiter = roundPrice(pricePerLiter);
  }

  const station = values.fuelStation.trim();
  const notes = values.notes.trim();

  return {
    carId: values.carId,
    date: values.date,
    odometer: Number(values.odometer),
    liters,
    pricePerLiter,
    totalCost,
    fuelStation: station || undefined,
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
