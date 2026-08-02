import type {
  Car,
  FuelEntry,
  Insight,
  InsightCategory,
  InsightsUnlockStatus,
  ServiceRecord,
  VehicleDocument,
} from "@/types";

export type InsightContext = {
  now: Date;
  currency: string;
  cars: Car[];
  fuelEntries: FuelEntry[];
  serviceRecords: ServiceRecord[];
  documents: VehicleDocument[];
};

export type InsightRule = {
  id: string;
  category: InsightCategory;
  /** Evaluate against local data. Return null when not applicable. */
  evaluate: (ctx: InsightContext) => Insight | null;
};

export type InsightEngineResult = {
  unlock: InsightsUnlockStatus;
  insights: Insight[];
  featured: Insight | null;
};
