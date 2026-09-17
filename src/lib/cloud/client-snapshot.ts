"use client";

import { getDataMode } from "@/features/auth/local-migrate";
import type {
  AppSettings,
  Car,
  FuelEntry,
  SavedCalculation,
  ServiceRecord,
  VehicleDocument,
} from "@/types";

export type CloudSnapshot = {
  cars: Car[];
  fuelEntries: FuelEntry[];
  serviceRecords: ServiceRecord[];
  documents: VehicleDocument[];
  savedCalculations: SavedCalculation[];
  settings: AppSettings | null;
};

let cache: { userKey: string; data: CloudSnapshot; at: number } | null = null;
const TTL_MS = 8_000;

export function isCloudMode() {
  return getDataMode() === "cloud";
}

export function invalidateCloudCache() {
  cache = null;
}

export async function fetchCloudSnapshot(
  force = false,
): Promise<CloudSnapshot> {
  const now = Date.now();
  if (!force && cache && now - cache.at < TTL_MS) {
    return cache.data;
  }

  const res = await fetch("/api/me/snapshot", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load cloud data");
  }
  const json = (await res.json()) as { snapshot: CloudSnapshot };
  cache = { userKey: "me", data: json.snapshot, at: now };
  return json.snapshot;
}
