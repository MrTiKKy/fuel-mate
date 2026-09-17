import { getSql } from "@/lib/db/neon";
import type {
  AppSettings,
  Car,
  FuelEntry,
  SavedCalculation,
  ServiceRecord,
  VehicleDocument,
} from "@/types";

function dateToIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

function tsToIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export async function listCars(userId: string): Promise<Car[]> {
  const sql = getSql();
  const rows = await sql`
    select * from cars where user_id = ${userId} order by updated_at desc
  `;
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string,
    model: row.model as string,
    year: row.year as number | undefined,
    engine: (row.engine as string) ?? undefined,
    fuelType: row.fuel_type as Car["fuelType"],
    transmission: (row.transmission as Car["transmission"]) ?? undefined,
    horsepower: (row.horsepower as number) ?? undefined,
    tankCapacity: (row.tank_capacity as number) ?? undefined,
    averageConsumption: (row.average_consumption as number) ?? undefined,
    licensePlate: (row.license_plate as string) ?? undefined,
    color: (row.color as string) ?? undefined,
    purchaseDate: row.purchase_date ? dateToIso(row.purchase_date) : undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: tsToIso(row.created_at),
    updatedAt: tsToIso(row.updated_at),
  }));
}

export async function listFuelEntries(userId: string): Promise<FuelEntry[]> {
  const sql = getSql();
  const rows = await sql`
    select * from fuel_entries where user_id = ${userId} order by date desc, created_at desc
  `;
  return rows.map((row) => ({
    id: row.id as string,
    carId: row.car_id as string,
    date: dateToIso(row.date),
    distanceSinceLastRefuel: Number(row.distance_since_last_refuel ?? 0),
    odometer: row.odometer != null ? Number(row.odometer) : undefined,
    liters: Number(row.liters),
    pricePerLiter: Number(row.price_per_liter),
    totalCost: Number(row.total_cost),
    fuelStation: (row.fuel_station as string) ?? undefined,
    fuelType: row.fuel_type as FuelEntry["fuelType"],
    isFullTank: Boolean(row.is_full_tank),
    consumption: row.consumption != null ? Number(row.consumption) : undefined,
    costPerKm: row.cost_per_km != null ? Number(row.cost_per_km) : undefined,
    costPer100Km:
      row.cost_per_100km != null ? Number(row.cost_per_100km) : undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: tsToIso(row.created_at),
    updatedAt: tsToIso(row.updated_at),
  }));
}

export async function listServiceRecords(
  userId: string,
): Promise<ServiceRecord[]> {
  const sql = getSql();
  const rows = await sql`
    select * from service_records where user_id = ${userId} order by date_completed desc
  `;
  return rows.map((row) => ({
    id: row.id as string,
    carId: row.car_id as string,
    type: row.type as ServiceRecord["type"],
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    dateCompleted: dateToIso(row.date_completed),
    odometerCompleted:
      row.odometer_completed != null
        ? Number(row.odometer_completed)
        : undefined,
    reminderEnabled: Boolean(row.reminder_enabled),
    repeatInterval:
      row.repeat_interval != null ? Number(row.repeat_interval) : undefined,
    repeatUnit: (row.repeat_unit as ServiceRecord["repeatUnit"]) ?? undefined,
    nextDate: row.next_date ? dateToIso(row.next_date) : undefined,
    nextOdometer:
      row.next_odometer != null ? Number(row.next_odometer) : undefined,
    cost: Number(row.cost),
    garageName: (row.garage_name as string) ?? undefined,
    invoiceNumber: (row.invoice_number as string) ?? undefined,
    attachments: Array.isArray(row.attachments)
      ? (row.attachments as string[])
      : [],
    notes: (row.notes as string) ?? undefined,
    createdAt: tsToIso(row.created_at),
    updatedAt: tsToIso(row.updated_at),
  }));
}

export async function listDocuments(
  userId: string,
): Promise<VehicleDocument[]> {
  const sql = getSql();
  const rows = await sql`
    select * from documents where user_id = ${userId} order by updated_at desc
  `;
  return rows.map((row) => ({
    id: row.id as string,
    vehicleId: row.vehicle_id as string,
    type: row.type as VehicleDocument["type"],
    title: row.title as string,
    issueDate: row.issue_date ? dateToIso(row.issue_date) : undefined,
    expiryDate: row.expiry_date ? dateToIso(row.expiry_date) : undefined,
    issuer: (row.issuer as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    attachments: Array.isArray(row.attachments)
      ? (row.attachments as VehicleDocument["attachments"])
      : [],
    createdAt: tsToIso(row.created_at),
    updatedAt: tsToIso(row.updated_at),
  }));
}

export async function listSavedCalculations(
  userId: string,
): Promise<SavedCalculation[]> {
  const sql = getSql();
  const rows = await sql`
    select * from saved_calculations where user_id = ${userId} order by updated_at desc
  `;
  return rows.map((row) => ({
    id: row.id as string,
    calculatorType: row.calculator_type as SavedCalculation["calculatorType"],
    name: row.name as string,
    inputs: (row.inputs ?? {}) as Record<string, string>,
    results: (row.results ?? []) as SavedCalculation["results"],
    createdAt: tsToIso(row.created_at),
    updatedAt: tsToIso(row.updated_at),
  }));
}

export async function getUserSettings(
  userId: string,
): Promise<AppSettings | null> {
  const sql = getSql();
  const rows = await sql`
    select * from user_settings where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    currency: row.currency as AppSettings["currency"],
    distanceUnit: row.distance_unit as AppSettings["distanceUnit"],
    volumeUnit: row.volume_unit as AppSettings["volumeUnit"],
    consumptionUnit: row.consumption_unit as AppSettings["consumptionUnit"],
    activeCarId: (row.active_car_id as string) ?? undefined,
    preferredFuelType:
      (row.preferred_fuel_type as AppSettings["preferredFuelType"]) ??
      undefined,
    defaultTankCapacity:
      row.default_tank_capacity != null
        ? Number(row.default_tank_capacity)
        : undefined,
    theme: row.theme as AppSettings["theme"],
    accentColor: row.accent_color as AppSettings["accentColor"],
    notifications: (row.notifications ??
      {}) as AppSettings["notifications"],
    lastBackupAt: row.last_backup_at
      ? tsToIso(row.last_backup_at)
      : undefined,
  };
}

export async function getUserSnapshot(userId: string) {
  const [cars, fuelEntries, serviceRecords, documents, savedCalculations, settings] =
    await Promise.all([
      listCars(userId),
      listFuelEntries(userId),
      listServiceRecords(userId),
      listDocuments(userId),
      listSavedCalculations(userId),
      getUserSettings(userId),
    ]);

  return {
    cars,
    fuelEntries,
    serviceRecords,
    documents,
    savedCalculations,
    settings,
  };
}
