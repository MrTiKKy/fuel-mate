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
  /** Distance driven since previous refuel (km). Used for consumption. */
  distanceSinceLastRefuel: number;
  /** @deprecated Legacy absolute odometer — kept for older backups */
  odometer?: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  /** @deprecated Removed from form — kept for older backups */
  fuelStation?: string;
  fuelType: FuelType;
  isFullTank: boolean;
  /** L/100km — from distance + liters when full tank (or distance present) */
  consumption?: number;
  costPerKm?: number;
  costPer100Km?: number;
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

export type ServiceStatus = "completed" | "upcoming" | "due_soon" | "overdue";

export type RepeatUnit = "months" | "years" | "kilometers";

export type ServiceRecord = {
  id: UUID;
  carId: UUID;
  type: ServiceType;
  title: string;
  description?: string;
  dateCompleted: string;
  /** @deprecated Optional legacy mileage */
  odometerCompleted?: number;
  /** Recurring reminder configuration */
  reminderEnabled: boolean;
  repeatInterval?: number;
  repeatUnit?: RepeatUnit;
  /** Derived / stored next due date for month/year repeats */
  nextDate?: string;
  /** @deprecated Prefer km tracking via fuel distances + repeatInterval */
  nextOdometer?: number;
  cost: number;
  garageName?: string;
  invoiceNumber?: string;
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
  status: Extract<ServiceStatus, "upcoming" | "due_soon" | "overdue">;
  repeatInterval?: number;
  repeatUnit?: RepeatUnit;
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

export type DocumentType =
  | "insurance_rca"
  | "casco"
  | "itp"
  | "vehicle_registration"
  | "vehicle_identity_card"
  | "driving_license"
  | "purchase_invoice"
  | "service_invoice"
  | "fuel_receipt"
  | "tyre_invoice"
  | "road_tax"
  | "warranty"
  | "other";

export type DocumentAttachment = {
  id: UUID;
  name: string;
  mimeType: string;
  size: number;
  /** Object URL / blob key resolved at runtime */
  createdAt: string;
};

export type VehicleDocument = {
  id: UUID;
  vehicleId: UUID;
  type: DocumentType;
  title: string;
  issueDate?: string;
  expiryDate?: string;
  issuer?: string;
  notes?: string;
  attachments: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDocumentInput = Omit<
  VehicleDocument,
  "id" | "createdAt" | "updatedAt" | "attachments"
> & {
  attachments?: DocumentAttachment[];
};

export type UpdateDocumentInput = Partial<CreateDocumentInput>;

export type DocumentFileBlob = {
  id: UUID;
  documentId: UUID;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
};

export type DocumentReminder = {
  id: UUID;
  documentId: UUID;
  vehicleId: UUID;
  title: string;
  type: DocumentType;
  expiryDate: string;
  daysRemaining: number;
  status: "upcoming" | "due_soon" | "overdue";
  priority: "low" | "medium" | "high";
};

export type InsightCategory =
  | "fuel"
  | "maintenance"
  | "expenses"
  | "documents"
  | "driving"
  | "vehicle_health";

export type InsightSeverity = "info" | "positive" | "warning" | "critical";

export type Insight = {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  severity: InsightSeverity;
  createdAt: string;
};

export type InsightsUnlockStatus = {
  unlocked: boolean;
  fuelEntries: number;
  expenses: number;
  monthsOfData: number;
  reason?: string;
};

export type CalculatorType =
  | "fuel-cost"
  | "trip-split"
  | "annual-fuel"
  | "fuel-needed"
  | "tank-fill"
  | "cost-per-km"
  | "maintenance";

export type SavedCalculationResult = {
  label: string;
  value: string;
  emphasize?: boolean;
};

export type SavedCalculation = {
  id: UUID;
  calculatorType: CalculatorType;
  name: string;
  inputs: Record<string, string>;
  results: SavedCalculationResult[];
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedCalculationInput = Omit<
  SavedCalculation,
  "id" | "createdAt" | "updatedAt"
>;

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

export type BackupDocumentFile = {
  id: UUID;
  documentId: UUID;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  /** Base64-encoded binary for portable local backups */
  dataBase64: string;
};

export type BackupPayload = {
  version: number;
  exportedAt: string;
  metadata: BackupMetadata;
  cars: Car[];
  fuelEntries: FuelEntry[];
  serviceRecords: ServiceRecord[];
  documents: VehicleDocument[];
  documentFiles?: BackupDocumentFile[];
  savedCalculations?: SavedCalculation[];
  settings: AppSettings;
};

export type ImportSummary = {
  cars: number;
  fuelEntries: number;
  serviceRecords: number;
  documents: number;
  savedCalculations: number;
  settings: boolean;
};

export type DatabaseStats = {
  cars: number;
  fuelEntries: number;
  serviceRecords: number;
  documents: number;
  savedCalculations: number;
  estimatedSizeBytes: number;
  lastBackupAt?: string;
  status: "ok" | "empty" | "error";
};
