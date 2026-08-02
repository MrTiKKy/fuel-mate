/** Shared domain types */

export type UUID = string;

export type CurrencyCode = "USD" | "EUR" | "GBP" | "RON" | "PLN" | "CZK";

export type DistanceUnit = "km" | "mi";

export type VolumeUnit = "L" | "gal";

export type FuelType =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "plugin_hybrid"
  | "electric"
  | "lpg"
  | "cng";

export type TransmissionType =
  | "manual"
  | "automatic"
  | "cvt"
  | "dct"
  | "other";

export type Car = {
  id: UUID;
  name: string;
  brand: string;
  model: string;
  year?: number;
  engine?: string;
  fuelType: FuelType;
  transmission?: TransmissionType;
  horsepower?: number;
  tankCapacity?: number;
  averageConsumption?: number;
  licensePlate?: string;
  color?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCarInput = Omit<Car, "id" | "createdAt" | "updatedAt">;

export type UpdateCarInput = Partial<CreateCarInput>;

export type CarStats = {
  totalFuelEntries: number;
  totalDistance: number;
  totalFuelCost: number;
  averageConsumption: number;
};

export type FuelEntry = {
  id: UUID;
  carId: UUID;
  date: string;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  fuelStation?: string;
  fuelType: FuelType;
  isFullTank: boolean;
  /** L/100km — set when consecutive full-tank entries allow calculation */
  consumption?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFuelEntryInput = Omit<
  FuelEntry,
  "id" | "createdAt" | "updatedAt" | "consumption"
> & {
  consumption?: number;
};

export type UpdateFuelEntryInput = Partial<CreateFuelEntryInput>;

export type FuelStats = {
  totalFuelCost: number;
  totalLiters: number;
  averageConsumption: number;
  costPer100Km: number;
  costPerKm: number;
  distanceTravelled: number;
};

export type ServiceType =
  | "oil_change"
  | "oil_filter"
  | "air_filter"
  | "cabin_filter"
  | "fuel_filter"
  | "spark_plugs"
  | "timing_belt"
  | "timing_chain"
  | "brake_pads"
  | "brake_discs"
  | "brake_fluid"
  | "coolant"
  | "transmission_oil"
  | "battery"
  | "tyres"
  | "wheel_alignment"
  | "itp"
  | "insurance"
  | "road_tax"
  | "other";

export type ServiceStatus = "completed" | "upcoming" | "overdue";

export type ServiceRecord = {
  id: UUID;
  carId: UUID;
  type: ServiceType;
  title: string;
  description?: string;
  dateCompleted: string;
  odometerCompleted: number;
  nextDate?: string;
  nextOdometer?: number;
  cost: number;
  garageName?: string;
  invoiceNumber?: string;
  /** Placeholder for future file attachments */
  attachments: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceInput = Omit<
  ServiceRecord,
  "id" | "createdAt" | "updatedAt" | "attachments"
> & {
  attachments?: string[];
};

export type UpdateServiceInput = Partial<CreateServiceInput>;

export type ServiceReminder = {
  id: UUID;
  carId: UUID;
  recordId: UUID;
  title: string;
  type: ServiceType;
  nextDate?: string;
  nextOdometer?: number;
  daysRemaining: number | null;
  kmRemaining: number | null;
  priority: "low" | "medium" | "high";
  status: Extract<ServiceStatus, "upcoming" | "overdue">;
};

export type ServiceStats = {
  totalMaintenanceCost: number;
  costThisMonth: number;
  costThisYear: number;
  mostCommonService: ServiceType | null;
  mostCommonServiceCount: number;
  averageYearlyMaintenance: number;
  recordCount: number;
};

export type ConsumptionUnit = "l_100km" | "mpg_uk" | "mpg_us";

export type AccentColor = "teal" | "blue" | "green" | "orange";

export type NotificationSettings = {
  serviceReminders: boolean;
  oilReminders: boolean;
  insuranceReminders: boolean;
  itpReminders: boolean;
  fuelReminders: boolean;
};

export type AppSettings = {
  currency: CurrencyCode;
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  consumptionUnit: ConsumptionUnit;
  activeCarId?: UUID;
  preferredFuelType?: FuelType;
  defaultTankCapacity?: number;
  theme: "dark" | "light" | "system";
  /** Prepared for future theming — not applied yet */
  accentColor: AccentColor;
  notifications: NotificationSettings;
  lastBackupAt?: string;
};

export type BackupMetadata = {
  appName: string;
  appVersion: string;
  buildVersion: string;
  exportedAt: string;
  schemaVersion: number;
};

export type BackupPayload = {
  version: number;
  exportedAt: string;
  metadata: BackupMetadata;
  cars: Car[];
  fuelEntries: FuelEntry[];
  serviceRecords: ServiceRecord[];
  settings: AppSettings;
};

export type ImportSummary = {
  cars: number;
  fuelEntries: number;
  serviceRecords: number;
  settings: boolean;
};

export type DatabaseStats = {
  cars: number;
  fuelEntries: number;
  serviceRecords: number;
  estimatedSizeBytes: number;
  lastBackupAt?: string;
  status: "ok" | "empty" | "error";
};
