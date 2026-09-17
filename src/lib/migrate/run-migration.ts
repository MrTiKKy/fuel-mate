import { getSql } from "@/lib/db/neon";
import {
  asBool,
  asDateOnly,
  asNumber,
  asString,
  asTimestamptz,
  base64ToBuffer,
  type MigratePayload,
  type MigrateResult,
} from "@/lib/migrate/schema";

/**
 * One-time IndexedDB → Neon migration for a single authenticated user.
 *
 * Strategies:
 * - merge (default / Unește): upsert by id for this user_id (idempotent)
 * - cloud: insert only rows whose id is not already owned by this user
 * - local: same as merge (local payload overwrites cloud fields for matching ids)
 *
 * Conflict with another user's id: skip that row (logged in counts as 0) —
 * UUIDs from IndexedDB are unique per device; cross-user collision is negligible.
 */
export async function migrateLocalDumpToNeon(
  userId: string,
  payload: MigratePayload,
): Promise<MigrateResult> {
  const sql = getSql();
  const strategy = payload.strategy;

  const existing = await sql`
    select
      (select count(*)::int from cars where user_id = ${userId}) as cars,
      (select count(*)::int from fuel_entries where user_id = ${userId}) as fuel,
      (select count(*)::int from service_records where user_id = ${userId}) as service,
      (select count(*)::int from documents where user_id = ${userId}) as documents
  `;
  const cloudHasData =
    (existing[0]?.cars ?? 0) > 0 ||
    (existing[0]?.fuel ?? 0) > 0 ||
    (existing[0]?.service ?? 0) > 0 ||
    (existing[0]?.documents ?? 0) > 0;

  const counts = {
    cars: 0,
    fuelEntries: 0,
    serviceRecords: 0,
    documents: 0,
    documentFiles: 0,
    savedCalculations: 0,
    settings: 0,
  };

  // Cars
  for (const raw of payload.cars) {
    const id = asString(raw.id);
    if (!id) continue;

    if (strategy === "cloud" && cloudHasData) {
      const found = await sql`select id from cars where id = ${id} and user_id = ${userId} limit 1`;
      if (found.length > 0) continue;
    }

    const owner = await sql`select user_id from cars where id = ${id} limit 1`;
    if (owner[0] && owner[0].user_id !== userId) continue;

    await sql`
      insert into cars (
        id, user_id, name, brand, model, year, engine, fuel_type, transmission,
        horsepower, tank_capacity, average_consumption, license_plate, color,
        purchase_date, notes, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${asString(raw.name, "Vehicle")},
        ${asString(raw.brand, "—")},
        ${asString(raw.model, "—")},
        ${typeof raw.year === "number" ? raw.year : null},
        ${typeof raw.engine === "string" ? raw.engine : null},
        ${asString(raw.fuelType, "petrol")},
        ${typeof raw.transmission === "string" ? raw.transmission : null},
        ${typeof raw.horsepower === "number" ? raw.horsepower : null},
        ${typeof raw.tankCapacity === "number" ? raw.tankCapacity : null},
        ${typeof raw.averageConsumption === "number" ? raw.averageConsumption : null},
        ${typeof raw.licensePlate === "string" ? raw.licensePlate : null},
        ${typeof raw.color === "string" ? raw.color : null},
        ${asDateOnly(raw.purchaseDate)},
        ${typeof raw.notes === "string" ? raw.notes : null},
        ${asTimestamptz(raw.createdAt)}::timestamptz,
        ${asTimestamptz(raw.updatedAt)}::timestamptz
      )
      on conflict (id) do update set
        user_id = excluded.user_id,
        name = excluded.name,
        brand = excluded.brand,
        model = excluded.model,
        year = excluded.year,
        engine = excluded.engine,
        fuel_type = excluded.fuel_type,
        transmission = excluded.transmission,
        horsepower = excluded.horsepower,
        tank_capacity = excluded.tank_capacity,
        average_consumption = excluded.average_consumption,
        license_plate = excluded.license_plate,
        color = excluded.color,
        purchase_date = excluded.purchase_date,
        notes = excluded.notes,
        updated_at = excluded.updated_at
      where cars.user_id = ${userId}
    `;
    counts.cars += 1;
  }

  // Fuel
  for (const raw of payload.fuelEntries) {
    const id = asString(raw.id);
    const carId = asString(raw.carId);
    if (!id || !carId) continue;

    if (strategy === "cloud") {
      const found = await sql`select id from fuel_entries where id = ${id} and user_id = ${userId} limit 1`;
      if (found.length > 0) continue;
    }

    const owner = await sql`select user_id from fuel_entries where id = ${id} limit 1`;
    if (owner[0] && owner[0].user_id !== userId) continue;

    await sql`
      insert into fuel_entries (
        id, user_id, car_id, date, distance_since_last_refuel, odometer, liters,
        price_per_liter, total_cost, fuel_station, fuel_type, is_full_tank,
        consumption, cost_per_km, cost_per_100km, notes, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${carId},
        ${asDateOnly(raw.date) ?? new Date().toISOString().slice(0, 10)}::date,
        ${asNumber(raw.distanceSinceLastRefuel, 0)},
        ${typeof raw.odometer === "number" ? raw.odometer : null},
        ${asNumber(raw.liters, 0)},
        ${asNumber(raw.pricePerLiter, 0)},
        ${asNumber(raw.totalCost, 0)},
        ${typeof raw.fuelStation === "string" ? raw.fuelStation : null},
        ${asString(raw.fuelType, "petrol")},
        ${asBool(raw.isFullTank, true)},
        ${typeof raw.consumption === "number" ? raw.consumption : null},
        ${typeof raw.costPerKm === "number" ? raw.costPerKm : null},
        ${typeof raw.costPer100Km === "number" ? raw.costPer100Km : null},
        ${typeof raw.notes === "string" ? raw.notes : null},
        ${asTimestamptz(raw.createdAt)}::timestamptz,
        ${asTimestamptz(raw.updatedAt)}::timestamptz
      )
      on conflict (id) do update set
        user_id = excluded.user_id,
        car_id = excluded.car_id,
        date = excluded.date,
        distance_since_last_refuel = excluded.distance_since_last_refuel,
        odometer = excluded.odometer,
        liters = excluded.liters,
        price_per_liter = excluded.price_per_liter,
        total_cost = excluded.total_cost,
        fuel_station = excluded.fuel_station,
        fuel_type = excluded.fuel_type,
        is_full_tank = excluded.is_full_tank,
        consumption = excluded.consumption,
        cost_per_km = excluded.cost_per_km,
        cost_per_100km = excluded.cost_per_100km,
        notes = excluded.notes,
        updated_at = excluded.updated_at
      where fuel_entries.user_id = ${userId}
    `;
    counts.fuelEntries += 1;
  }

  // Service
  for (const raw of payload.serviceRecords) {
    const id = asString(raw.id);
    const carId = asString(raw.carId);
    if (!id || !carId) continue;

    if (strategy === "cloud") {
      const found = await sql`select id from service_records where id = ${id} and user_id = ${userId} limit 1`;
      if (found.length > 0) continue;
    }

    const owner = await sql`select user_id from service_records where id = ${id} limit 1`;
    if (owner[0] && owner[0].user_id !== userId) continue;

    const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];

    await sql`
      insert into service_records (
        id, user_id, car_id, type, title, description, date_completed,
        odometer_completed, reminder_enabled, repeat_interval, repeat_unit,
        next_date, next_odometer, cost, garage_name, invoice_number,
        attachments, notes, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${carId},
        ${asString(raw.type, "other")},
        ${asString(raw.title, "Service")},
        ${typeof raw.description === "string" ? raw.description : null},
        ${asDateOnly(raw.dateCompleted) ?? new Date().toISOString().slice(0, 10)}::date,
        ${typeof raw.odometerCompleted === "number" ? raw.odometerCompleted : null},
        ${asBool(raw.reminderEnabled, false)},
        ${typeof raw.repeatInterval === "number" ? raw.repeatInterval : null},
        ${typeof raw.repeatUnit === "string" ? raw.repeatUnit : null},
        ${asDateOnly(raw.nextDate)},
        ${typeof raw.nextOdometer === "number" ? raw.nextOdometer : null},
        ${asNumber(raw.cost, 0)},
        ${typeof raw.garageName === "string" ? raw.garageName : null},
        ${typeof raw.invoiceNumber === "string" ? raw.invoiceNumber : null},
        ${JSON.stringify(attachments)}::jsonb,
        ${typeof raw.notes === "string" ? raw.notes : null},
        ${asTimestamptz(raw.createdAt)}::timestamptz,
        ${asTimestamptz(raw.updatedAt)}::timestamptz
      )
      on conflict (id) do update set
        user_id = excluded.user_id,
        car_id = excluded.car_id,
        type = excluded.type,
        title = excluded.title,
        description = excluded.description,
        date_completed = excluded.date_completed,
        odometer_completed = excluded.odometer_completed,
        reminder_enabled = excluded.reminder_enabled,
        repeat_interval = excluded.repeat_interval,
        repeat_unit = excluded.repeat_unit,
        next_date = excluded.next_date,
        next_odometer = excluded.next_odometer,
        cost = excluded.cost,
        garage_name = excluded.garage_name,
        invoice_number = excluded.invoice_number,
        attachments = excluded.attachments,
        notes = excluded.notes,
        updated_at = excluded.updated_at
      where service_records.user_id = ${userId}
    `;
    counts.serviceRecords += 1;
  }

  // Documents
  for (const raw of payload.documents) {
    const id = asString(raw.id);
    const vehicleId = asString(raw.vehicleId);
    if (!id || !vehicleId) continue;

    if (strategy === "cloud") {
      const found = await sql`select id from documents where id = ${id} and user_id = ${userId} limit 1`;
      if (found.length > 0) continue;
    }

    const owner = await sql`select user_id from documents where id = ${id} limit 1`;
    if (owner[0] && owner[0].user_id !== userId) continue;

    const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];

    await sql`
      insert into documents (
        id, user_id, vehicle_id, type, title, issue_date, expiry_date,
        issuer, notes, attachments, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${vehicleId},
        ${asString(raw.type, "other")},
        ${asString(raw.title, "Document")},
        ${asDateOnly(raw.issueDate)},
        ${asDateOnly(raw.expiryDate)},
        ${typeof raw.issuer === "string" ? raw.issuer : null},
        ${typeof raw.notes === "string" ? raw.notes : null},
        ${JSON.stringify(attachments)}::jsonb,
        ${asTimestamptz(raw.createdAt)}::timestamptz,
        ${asTimestamptz(raw.updatedAt)}::timestamptz
      )
      on conflict (id) do update set
        user_id = excluded.user_id,
        vehicle_id = excluded.vehicle_id,
        type = excluded.type,
        title = excluded.title,
        issue_date = excluded.issue_date,
        expiry_date = excluded.expiry_date,
        issuer = excluded.issuer,
        notes = excluded.notes,
        attachments = excluded.attachments,
        updated_at = excluded.updated_at
      where documents.user_id = ${userId}
    `;
    counts.documents += 1;
  }

  // Document files (bytes MVP)
  for (const file of payload.documentFiles) {
    if (strategy === "cloud") {
      const found = await sql`select id from document_files where id = ${file.id} limit 1`;
      if (found.length > 0) continue;
    }

    const doc = await sql`
      select id from documents where id = ${file.documentId} and user_id = ${userId} limit 1
    `;
    if (doc.length === 0) continue;

    const buffer = base64ToBuffer(file.dataBase64);

    await sql`
      insert into document_files (
        id, document_id, name, mime_type, size, storage_key, data, created_at
      ) values (
        ${file.id},
        ${file.documentId},
        ${file.name},
        ${file.mimeType},
        ${file.size},
        ${file.storageKey ?? null},
        ${buffer},
        ${asTimestamptz(file.createdAt)}::timestamptz
      )
      on conflict (id) do update set
        document_id = excluded.document_id,
        name = excluded.name,
        mime_type = excluded.mime_type,
        size = excluded.size,
        storage_key = excluded.storage_key,
        data = coalesce(excluded.data, document_files.data)
    `;
    counts.documentFiles += 1;
  }

  // Saved calculations
  for (const raw of payload.savedCalculations) {
    const id = asString(raw.id);
    if (!id) continue;

    if (strategy === "cloud") {
      const found = await sql`select id from saved_calculations where id = ${id} and user_id = ${userId} limit 1`;
      if (found.length > 0) continue;
    }

    const owner = await sql`select user_id from saved_calculations where id = ${id} limit 1`;
    if (owner[0] && owner[0].user_id !== userId) continue;

    await sql`
      insert into saved_calculations (
        id, user_id, calculator_type, name, inputs, results, created_at, updated_at
      ) values (
        ${id},
        ${userId},
        ${asString(raw.calculatorType, "fuel-cost")},
        ${asString(raw.name, "Saved")},
        ${JSON.stringify(raw.inputs ?? {})}::jsonb,
        ${JSON.stringify(raw.results ?? [])}::jsonb,
        ${asTimestamptz(raw.createdAt)}::timestamptz,
        ${asTimestamptz(raw.updatedAt)}::timestamptz
      )
      on conflict (id) do update set
        user_id = excluded.user_id,
        calculator_type = excluded.calculator_type,
        name = excluded.name,
        inputs = excluded.inputs,
        results = excluded.results,
        updated_at = excluded.updated_at
      where saved_calculations.user_id = ${userId}
    `;
    counts.savedCalculations += 1;
  }

  // Settings
  if (payload.settings && typeof payload.settings === "object") {
    const s = payload.settings;
    const shouldWrite =
      strategy !== "cloud" ||
      (
        await sql`select user_id from user_settings where user_id = ${userId} limit 1`
      ).length === 0;

    if (shouldWrite) {
      await sql`
        insert into user_settings (
          user_id, currency, distance_unit, volume_unit, consumption_unit,
          active_car_id, preferred_fuel_type, default_tank_capacity, theme,
          accent_color, notifications, last_backup_at, created_at, updated_at
        ) values (
          ${userId},
          ${asString(s.currency, "RON")},
          ${asString(s.distanceUnit, "km")},
          ${asString(s.volumeUnit, "L")},
          ${asString(s.consumptionUnit, "l_100km")},
          ${typeof s.activeCarId === "string" ? s.activeCarId : null},
          ${typeof s.preferredFuelType === "string" ? s.preferredFuelType : null},
          ${typeof s.defaultTankCapacity === "number" ? s.defaultTankCapacity : null},
          ${asString(s.theme, "dark")},
          ${asString(s.accentColor, "teal")},
          ${JSON.stringify(s.notifications ?? {})}::jsonb,
          ${typeof s.lastBackupAt === "string" ? s.lastBackupAt : null},
          now(),
          now()
        )
        on conflict (user_id) do update set
          currency = excluded.currency,
          distance_unit = excluded.distance_unit,
          volume_unit = excluded.volume_unit,
          consumption_unit = excluded.consumption_unit,
          active_car_id = excluded.active_car_id,
          preferred_fuel_type = excluded.preferred_fuel_type,
          default_tank_capacity = excluded.default_tank_capacity,
          theme = excluded.theme,
          accent_color = excluded.accent_color,
          notifications = excluded.notifications,
          last_backup_at = excluded.last_backup_at,
          updated_at = now()
      `;
      counts.settings = 1;
    }
  }

  return {
    ok: true,
    strategy,
    migratedAt: new Date().toISOString(),
    counts,
  };
}

export async function getUserCloudSummary(userId: string) {
  const sql = getSql();
  const rows = await sql`
    select
      (select count(*)::int from cars where user_id = ${userId}) as cars,
      (select count(*)::int from fuel_entries where user_id = ${userId}) as "fuelEntries",
      (select count(*)::int from service_records where user_id = ${userId}) as "serviceRecords",
      (select count(*)::int from documents where user_id = ${userId}) as documents,
      (select count(*)::int from saved_calculations where user_id = ${userId}) as "savedCalculations"
  `;
  return rows[0] as {
    cars: number;
    fuelEntries: number;
    serviceRecords: number;
    documents: number;
    savedCalculations: number;
  };
}
