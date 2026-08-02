"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { CarFab } from "@/features/cars/components/car-fab";
import { CarFormSheet } from "@/features/cars/components/car-form-sheet";
import { CarList } from "@/features/cars/components/car-list";
import { DeleteCarDialog } from "@/features/cars/components/delete-car-dialog";
import type { CarAction } from "@/features/cars/components/car-actions-menu";
import { useCars } from "@/features/cars/hooks/use-cars";
import { formValuesToCarInput } from "@/features/cars/utils";
import type { CarFormValues } from "@/lib/validations/car";
import type { Car } from "@/types";

export function CarsPageClient() {
  const {
    cars,
    activeCarId,
    isLoading,
    isPending,
    createCar,
    updateCar,
    deleteCar,
    setActiveCar,
    duplicateCar,
    run,
  } = useCars();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);

  const openCreate = () => {
    setEditingCar(null);
    setSheetOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setSheetOpen(true);
  };

  const handleAction = (car: Car, action: CarAction) => {
    switch (action) {
      case "edit":
        openEdit(car);
        break;
      case "delete":
        setDeletingCar(car);
        break;
      case "set-active":
        run(() => setActiveCar(car.id));
        break;
      case "duplicate":
        run(() => duplicateCar(car));
        break;
    }
  };

  const handleSubmit = async (values: CarFormValues) => {
    const input = formValuesToCarInput(values);
    if (editingCar) {
      await updateCar(editingCar.id, input);
    } else {
      await createCar(input);
    }
  };

  return (
    <>
      <AppHeader
        title="Cars"
        subtitle={
          isLoading
            ? "Loading garage…"
            : cars.length === 0
              ? "Manage your vehicles"
              : `${cars.length} vehicle${cars.length === 1 ? "" : "s"}`
        }
      />

      <PageContainer>
        <CarList
          cars={cars}
          activeCarId={activeCarId}
          isLoading={isLoading}
          onAdd={openCreate}
          onAction={handleAction}
        />
      </PageContainer>

      <CarFab onClick={openCreate} />

      <CarFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        car={editingCar}
        onSubmit={handleSubmit}
      />

      <DeleteCarDialog
        car={deletingCar}
        open={Boolean(deletingCar)}
        onOpenChange={(open) => {
          if (!open) setDeletingCar(null);
        }}
        onConfirm={() => {
          if (!deletingCar) return;
          const id = deletingCar.id;
          setDeletingCar(null);
          run(() => deleteCar(id));
        }}
      />

      {isPending ? (
        <span className="sr-only" aria-live="polite">
          Updating…
        </span>
      ) : null}
    </>
  );
}
