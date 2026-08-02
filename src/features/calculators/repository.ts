import { getDatabase, STORES } from "@/lib/db";
import { createId } from "@/features/cars/utils";
import type {
  CalculatorType,
  CreateSavedCalculationInput,
  SavedCalculation,
} from "@/types";

function sortNewest(items: SavedCalculation[]) {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getSavedCalculations(): Promise<SavedCalculation[]> {
  const db = await getDatabase();
  return sortNewest(await db.getAll(STORES.savedCalculations));
}

export async function getSavedCalculationsByType(
  calculatorType: CalculatorType,
): Promise<SavedCalculation[]> {
  const db = await getDatabase();
  const items = await db.getAllFromIndex(
    STORES.savedCalculations,
    "by-type",
    calculatorType,
  );
  return sortNewest(items);
}

export async function getSavedCalculation(
  id: string,
): Promise<SavedCalculation | undefined> {
  const db = await getDatabase();
  return db.get(STORES.savedCalculations, id);
}

export async function createSavedCalculation(
  input: CreateSavedCalculationInput,
): Promise<SavedCalculation> {
  const now = new Date().toISOString();
  const record: SavedCalculation = {
    id: createId(),
    calculatorType: input.calculatorType,
    name: input.name.trim(),
    inputs: { ...input.inputs },
    results: input.results.map((row) => ({ ...row })),
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  await db.put(STORES.savedCalculations, record);
  return record;
}

export async function updateSavedCalculation(
  id: string,
  partial: Partial<
    Pick<SavedCalculation, "name" | "inputs" | "results" | "calculatorType">
  >,
): Promise<SavedCalculation> {
  const existing = await getSavedCalculation(id);
  if (!existing) {
    throw new Error("Saved calculation not found");
  }

  const next: SavedCalculation = {
    ...existing,
    ...partial,
    name: partial.name !== undefined ? partial.name.trim() : existing.name,
    inputs: partial.inputs ? { ...partial.inputs } : existing.inputs,
    results: partial.results
      ? partial.results.map((row) => ({ ...row }))
      : existing.results,
    updatedAt: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.put(STORES.savedCalculations, next);
  return next;
}

export async function duplicateSavedCalculation(
  id: string,
): Promise<SavedCalculation> {
  const existing = await getSavedCalculation(id);
  if (!existing) {
    throw new Error("Saved calculation not found");
  }

  return createSavedCalculation({
    calculatorType: existing.calculatorType,
    name: `${existing.name} (Copy)`,
    inputs: existing.inputs,
    results: existing.results,
  });
}

export async function deleteSavedCalculation(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete(STORES.savedCalculations, id);
}
