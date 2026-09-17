import { z } from "zod";

const isoDate = z.string().optional();

export const migratePayloadSchema = z.object({
  strategy: z.enum(["merge", "cloud", "local"]).default("merge"),
  cars: z.array(z.record(z.unknown())).default([]),
  fuelEntries: z.array(z.record(z.unknown())).default([]),
  serviceRecords: z.array(z.record(z.unknown())).default([]),
  documents: z.array(z.record(z.unknown())).default([]),
  documentFiles: z
    .array(
      z.object({
        id: z.string(),
        documentId: z.string(),
        name: z.string(),
        mimeType: z.string(),
        size: z.number(),
        createdAt: z.string().optional(),
        dataBase64: z.string().optional(),
        storageKey: z.string().optional(),
      }),
    )
    .default([]),
  savedCalculations: z.array(z.record(z.unknown())).default([]),
  settings: z.record(z.unknown()).nullable().optional(),
});

export type MigratePayload = z.infer<typeof migratePayloadSchema>;

export type MigrateResult = {
  ok: true;
  strategy: MigratePayload["strategy"];
  migratedAt: string;
  counts: {
    cars: number;
    fuelEntries: number;
    serviceRecords: number;
    documents: number;
    documentFiles: number;
    savedCalculations: number;
    settings: number;
  };
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asDateOnly(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return value.slice(0, 10);
}

function asTimestamptz(value: unknown): string {
  if (typeof value === "string" && value) return value;
  return new Date().toISOString();
}

function base64ToBuffer(dataBase64?: string): Uint8Array | null {
  if (!dataBase64) return null;
  try {
    return Uint8Array.from(Buffer.from(dataBase64, "base64"));
  } catch {
    return null;
  }
}

export { asString, asNumber, asBool, asDateOnly, asTimestamptz, base64ToBuffer, isoDate };
