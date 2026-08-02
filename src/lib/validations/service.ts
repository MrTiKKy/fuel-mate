import { z } from "zod";
import { parseLocaleNumber } from "@/lib/numbers";

export const serviceTypeSchema = z.enum([
  "oil_change",
  "oil_filter",
  "air_filter",
  "cabin_filter",
  "fuel_filter",
  "spark_plugs",
  "timing_belt",
  "timing_chain",
  "brake_pads",
  "brake_discs",
  "brake_fluid",
  "coolant",
  "transmission_oil",
  "battery",
  "tyres",
  "wheel_alignment",
  "itp",
  "insurance",
  "road_tax",
  "other",
]);

export const repeatUnitSchema = z.enum(["months", "years", "kilometers"]);

export const serviceFormSchema = z
  .object({
    carId: z.string().min(1, "Select a vehicle"),
    type: serviceTypeSchema,
    title: z.string().trim().min(1, "Title is required").max(80),
    dateCompleted: z.string().min(1, "Completion date is required"),
    cost: z.string().min(1, "Cost is required"),
    notes: z.string().max(1000),
    reminderEnabled: z.boolean(),
    repeatInterval: z.string(),
    repeatUnit: repeatUnitSchema,
  })
  .superRefine((data, ctx) => {
    const cost = parseLocaleNumber(data.cost);
    if (!Number.isFinite(cost) || cost < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cost must be 0 or greater",
        path: ["cost"],
      });
    }

    if (data.reminderEnabled) {
      const interval = parseLocaleNumber(data.repeatInterval);
      if (!Number.isFinite(interval) || interval <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a repeat interval",
          path: ["repeatInterval"],
        });
      }
    }
  });

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
