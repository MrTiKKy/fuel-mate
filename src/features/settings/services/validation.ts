import { z } from "zod";
import { fuelTypeSchema } from "@/lib/validations/car";
import { BACKUP_SCHEMA_VERSION } from "@/features/settings/constants";

const notificationSettingsSchema = z.object({
  serviceReminders: z.boolean(),
  oilReminders: z.boolean(),
  insuranceReminders: z.boolean(),
  itpReminders: z.boolean(),
  fuelReminders: z.boolean(),
});

const appSettingsSchema = z.object({
  currency: z.enum(["USD", "EUR", "GBP", "RON", "PLN", "CZK"]),
  distanceUnit: z.enum(["km", "mi"]),
  volumeUnit: z.enum(["L", "gal"]),
  consumptionUnit: z.enum(["l_100km", "mpg_uk", "mpg_us"]).optional(),
  activeCarId: z.string().optional(),
  preferredFuelType: fuelTypeSchema.optional(),
  defaultTankCapacity: z.number().positive().optional(),
  theme: z.enum(["dark", "light", "system"]),
  accentColor: z.enum(["teal", "blue", "green", "orange"]).optional(),
  notifications: notificationSettingsSchema.optional(),
  lastBackupAt: z.string().optional(),
});

const carSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    fuelType: fuelTypeSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

const fuelEntrySchema = z
  .object({
    id: z.string(),
    carId: z.string(),
    date: z.string(),
    liters: z.number(),
    pricePerLiter: z.number(),
    totalCost: z.number(),
    fuelType: fuelTypeSchema,
    isFullTank: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    distanceSinceLastRefuel: z.number().optional(),
    odometer: z.number().optional(),
  })
  .passthrough();

const serviceRecordSchema = z
  .object({
    id: z.string(),
    carId: z.string(),
    type: z.string(),
    title: z.string(),
    dateCompleted: z.string(),
    cost: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    odometerCompleted: z.number().optional(),
    reminderEnabled: z.boolean().optional(),
    repeatInterval: z.number().optional(),
    repeatUnit: z.enum(["months", "years", "kilometers"]).optional(),
  })
  .passthrough();

const documentSchema = z
  .object({
    id: z.string(),
    vehicleId: z.string(),
    type: z.string(),
    title: z.string(),
    attachments: z.array(z.unknown()).default([]),
    createdAt: z.string(),
    updatedAt: z.string(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    issuer: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

const documentFileSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  createdAt: z.string(),
  dataBase64: z.string(),
});

const savedCalculationSchema = z
  .object({
    id: z.string(),
    calculatorType: z.string(),
    name: z.string(),
    inputs: z.record(z.string(), z.string()),
    results: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        emphasize: z.boolean().optional(),
      }),
    ),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export const backupPayloadSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string(),
  metadata: z
    .object({
      appName: z.string(),
      appVersion: z.string(),
      buildVersion: z.string(),
      exportedAt: z.string(),
      schemaVersion: z.number(),
    })
    .optional(),
  cars: z.array(carSchema),
  fuelEntries: z.array(fuelEntrySchema),
  serviceRecords: z.array(serviceRecordSchema),
  documents: z.array(documentSchema).default([]),
  documentFiles: z.array(documentFileSchema).optional().default([]),
  savedCalculations: z.array(savedCalculationSchema).default([]),
  settings: appSettingsSchema,
});

export type ValidatedBackup = z.infer<typeof backupPayloadSchema>;

export function parseBackupJson(raw: unknown): ValidatedBackup {
  const parsed = backupPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid backup file. Schema validation failed.");
  }

  if (parsed.data.version > BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `This backup requires a newer app version (schema ${parsed.data.version}).`,
    );
  }

  return parsed.data;
}
