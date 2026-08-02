"use client";

import { Car } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/features/cars/components/car-card";
import type { CarAction } from "@/features/cars/components/car-actions-menu";
import { CarListSkeleton } from "@/features/cars/components/car-skeletons";
import type { Car as CarType } from "@/types";

type CarListProps = {
  cars: CarType[];
  activeCarId?: string;
  isLoading: boolean;
  onAdd: () => void;
  onAction: (car: CarType, action: CarAction) => void;
};

export function CarList({
  cars,
  activeCarId,
  isLoading,
  onAdd,
  onAction,
}: CarListProps) {
  if (isLoading) {
    return <CarListSkeleton />;
  }

  if (cars.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="Your garage is empty"
        description="Add your first vehicle to start tracking fuel, costs, and service — all stored locally on this device."
        action={
          <Button className="h-11 rounded-xl px-5" onClick={onAdd}>
            Add vehicle
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3 pb-20 md:pb-8">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          isActive={car.id === activeCarId}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
