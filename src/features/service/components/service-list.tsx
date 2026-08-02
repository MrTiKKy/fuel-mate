"use client";

import { Car, Wrench } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/features/service/components/service-card";
import type { ServiceAction } from "@/features/service/components/service-actions-menu";
import { ServiceListSkeleton } from "@/features/service/components/service-skeletons";
import { sumDistanceSince } from "@/features/fuel/utils";
import { getCarDisplayName } from "@/features/cars/utils";
import type { Car as CarType, FuelEntry, ServiceRecord } from "@/types";

type ServiceListProps = {
  cars: CarType[];
  grouped: Map<string, ServiceRecord[]>;
  fuelEntries: FuelEntry[];
  isLoading: boolean;
  onAdd: () => void;
  onAction: (record: ServiceRecord, action: ServiceAction) => void;
};

export function ServiceList({
  cars,
  grouped,
  fuelEntries,
  isLoading,
  onAdd,
  onAction,
}: ServiceListProps) {
  if (isLoading) return <ServiceListSkeleton />;

  if (cars.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="Add a vehicle first"
        description="Service entries belong to a car. Create one, then track maintenance."
        action={
          <Button asChild className="h-11 rounded-2xl px-5">
            <Link href="/cars">Go to Cars</Link>
          </Button>
        }
      />
    );
  }

  if (grouped.size === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No service entries"
        description="Log oil changes, ITP, tyres and more — reminders appear on your dashboard."
        action={
          <Button className="h-11 rounded-2xl px-5" onClick={onAdd}>
            Add service entry
          </Button>
        }
      />
    );
  }

  const carOrder = cars.map((c) => c.id);

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {carOrder.map((carId) => {
        const records = grouped.get(carId);
        if (!records?.length) return null;
        const car = cars.find((c) => c.id === carId);
        return (
          <section key={carId} className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">
              {car ? getCarDisplayName(car) : "Vehicle"}
            </h2>
            <div className="space-y-3">
              {records.map((record) => (
                <ServiceCard
                  key={record.id}
                  record={record}
                  kmDrivenSince={sumDistanceSince(
                    fuelEntries,
                    record.carId,
                    record.dateCompleted,
                  )}
                  onAction={onAction}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
