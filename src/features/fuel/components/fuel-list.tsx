"use client";

import { Car, Fuel } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FuelCard } from "@/features/fuel/components/fuel-card";
import type { FuelAction } from "@/features/fuel/components/fuel-actions-menu";
import { FuelListSkeleton } from "@/features/fuel/components/fuel-skeletons";
import type { Car as CarType, FuelEntry } from "@/types";

type FuelListProps = {
  entries: FuelEntry[];
  cars: CarType[];
  isLoading: boolean;
  onAdd: () => void;
  onAction: (entry: FuelEntry, action: FuelAction) => void;
};

export function FuelList({
  entries,
  cars,
  isLoading,
  onAdd,
  onAction,
}: FuelListProps) {
  if (isLoading) {
    return <FuelListSkeleton />;
  }

  if (cars.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="Add a vehicle first"
        description="Fuel entries belong to a car. Create a vehicle, then log your fill-ups."
        action={
          <Button asChild className="h-11 rounded-xl px-5">
            <Link href="/cars">Go to Cars</Link>
          </Button>
        }
      />
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Fuel}
        title="No fill-ups yet"
        description="Log your first fuel stop to track costs and consumption for this vehicle."
        action={
          <Button className="h-11 rounded-xl px-5" onClick={onAdd}>
            Add fuel entry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3 pb-20 md:pb-8">
      {entries.map((entry) => (
        <FuelCard key={entry.id} entry={entry} onAction={onAction} />
      ))}
    </div>
  );
}
