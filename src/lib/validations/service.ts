import { z } from "zod";

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

export const serviceFormSchema = z
  .object({
    carId: z.string().min(1, "Select a vehicle"),
    type: serviceTypeSchema,
    title: z.string().trim().min(1, "Title is required").max(80),
    description: z.string().max(500),
    dateCompleted: z.string().min(1, "Completion date is required"),
    odometerCompleted: z.string().min(1, "Odometer is required"),
    nextDate: z.string(),
    nextOdometer: z.string(),
    cost: z.string().min(1, "Cost is required"),
    garageName: z.string().max(80),
    invoiceNumber: z.string().max(60),
    notes: z.string().max(1000),
  })
  .superRefine((data, ctx) => {
    const odo = Number(data.odometerCompleted);
    const cost = Number(data.cost);
    const nextOdo = data.nextOdometer.trim()
      ? Number(data.nextOdometer)
      : undefined;

    if (Number.isNaN(odo) || odo < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid odometer",
        path: ["odometerCompleted"],
      });
    }

    if (Number.isNaN(cost) || cost < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cost must be 0 or greater",
        path: ["cost"],
      });
    }

    if (
      nextOdo !== undefined &&
      (Number.isNaN(nextOdo) || nextOdo < 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid next odometer",
        path: ["nextOdometer"],
      });
    }

    if (
      nextOdo !== undefined &&
      !Number.isNaN(odo) &&
      nextOdo < odo
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Next odometer must be ≥ completed mileage",
        path: ["nextOdometer"],
      });
    }
  });

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
