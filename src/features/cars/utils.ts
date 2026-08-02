import type { Car, CreateCarInput } from "@/types";
import {
  parseCarFormValues,
  type CarFormValues,
} from "@/lib/validations/car";
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
} from "@/features/cars/constants";

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `car_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCarDisplayName(car: Pick<Car, "name" | "brand" | "model">) {
  if (car.name?.trim()) return car.name.trim();
  return `${car.brand} ${car.model}`.trim();
}

export function getFuelTypeLabel(fuelType: Car["fuelType"]) {
  return FUEL_TYPE_LABELS[fuelType] ?? fuelType;
}

export function getTransmissionLabel(transmission?: Car["transmission"]) {
  if (!transmission) return undefined;
  return TRANSMISSION_LABELS[transmission] ?? transmission;
}

export function formatConsumption(value?: number) {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(1)} L/100km`;
}

export function formatTankCapacity(value?: number) {
  if (value === undefined || value === null) return "—";
  return `${value} L`;
}

export function formatHorsepower(value?: number) {
  if (value === undefined || value === null) return "—";
  return `${value} hp`;
}

function emptyToUndefined(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function formValuesToCarInput(values: CarFormValues): CreateCarInput {
  const parsed = parseCarFormValues(values);
  const brand = parsed.brand.trim();
  const model = parsed.model.trim();
  const name = emptyToUndefined(parsed.name) ?? `${brand} ${model}`;

  return {
    name,
    brand,
    model,
    year: parsed.year,
    engine: emptyToUndefined(parsed.engine),
    fuelType: parsed.fuelType,
    transmission: parsed.transmission,
    horsepower: parsed.horsepower,
    tankCapacity: parsed.tankCapacity,
    averageConsumption: parsed.averageConsumption,
    licensePlate: emptyToUndefined(parsed.licensePlate)?.toUpperCase(),
    color: emptyToUndefined(parsed.color),
    purchaseDate: emptyToUndefined(parsed.purchaseDate),
    notes: emptyToUndefined(parsed.notes),
  };
}

export function carToFormValues(car: Car): CarFormValues {
  return {
    name: car.name === `${car.brand} ${car.model}` ? "" : car.name,
    brand: car.brand,
    model: car.model,
    year: car.year?.toString() ?? "",
    engine: car.engine ?? "",
    fuelType: car.fuelType,
    transmission: car.transmission ?? "",
    horsepower: car.horsepower?.toString() ?? "",
    tankCapacity: car.tankCapacity?.toString() ?? "",
    averageConsumption: car.averageConsumption?.toString() ?? "",
    licensePlate: car.licensePlate ?? "",
    color: car.color ?? "",
    purchaseDate: car.purchaseDate ?? "",
    notes: car.notes ?? "",
  };
}

export function duplicateCarInput(car: Car): CreateCarInput {
  return {
    name: `${getCarDisplayName(car)} (Copy)`,
    brand: car.brand,
    model: car.model,
    year: car.year,
    engine: car.engine,
    fuelType: car.fuelType,
    transmission: car.transmission,
    horsepower: car.horsepower,
    tankCapacity: car.tankCapacity,
    averageConsumption: car.averageConsumption,
    licensePlate: car.licensePlate
      ? `${car.licensePlate}-COPY`
      : undefined,
    color: car.color,
    purchaseDate: car.purchaseDate,
    notes: car.notes,
  };
}
