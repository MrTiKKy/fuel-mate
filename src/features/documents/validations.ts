import { z } from "zod";

export const documentTypeSchema = z.enum([
  "insurance_rca",
  "casco",
  "itp",
  "vehicle_registration",
  "vehicle_identity_card",
  "driving_license",
  "purchase_invoice",
  "service_invoice",
  "fuel_receipt",
  "tyre_invoice",
  "road_tax",
  "warranty",
  "other",
]);

export const documentFormSchema = z
  .object({
    vehicleId: z.string().min(1, "Select a vehicle"),
    type: documentTypeSchema,
    title: z.string().trim().min(1, "Title is required").max(100),
    issueDate: z.string(),
    expiryDate: z.string(),
    issuer: z.string().max(100),
    notes: z.string().max(1000),
  })
  .superRefine((data, ctx) => {
    if (data.issueDate && data.expiryDate) {
      if (new Date(data.expiryDate) < new Date(data.issueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry must be on or after issue date",
          path: ["expiryDate"],
        });
      }
    }
  });

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
