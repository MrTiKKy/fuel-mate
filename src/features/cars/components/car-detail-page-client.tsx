"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CarDetailSkeleton } from "@/features/cars/components/car-skeletons";
import { CarDetailView } from "@/features/cars/components/car-detail-view";
import { CarFormSheet } from "@/features/cars/components/car-form-sheet";
import { DeleteCarDialog } from "@/features/cars/components/delete-car-dialog";
import { useCar } from "@/features/cars/hooks/use-car";
import {
  createCar,
  deleteCar,
  setActiveCar,
  updateCar,
} from "@/features/cars/repository";
import {
  duplicateCarInput,
  formValuesToCarInput,
} from "@/features/cars/utils";
import type { CarFormValues } from "@/lib/validations/car";
import { Compass } from "lucide-react";

type CarDetailPageClientProps = {
  carId: string;
};

export function CarDetailPageClient({ carId }: CarDetailPageClientProps) {
  const router = useRouter();
  const { car, isActive, isLoading, notFound, refresh } = useCar(carId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (values: CarFormValues) => {
    if (!car) return;
    await updateCar(car.id, formValuesToCarInput(values));
    toast.success("Vehicle updated");
    await refresh();
  };

  const handleSetActive = async () => {
    if (!car) return;
    setBusy(true);
    try {
      await setActiveCar(car.id);
      toast.success("Active vehicle updated");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async () => {
    if (!car) return;
    setBusy(true);
    try {
      const copy = await createCar(duplicateCarInput(car));
      toast.success("Vehicle duplicated");
      router.push(`/cars/${copy.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!car) return;
    setBusy(true);
    try {
      await deleteCar(car.id);
      toast.success("Vehicle deleted");
      router.replace("/cars");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Vehicle"
        subtitle={car ? `${car.brand} ${car.model}` : undefined}
        leading={
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl"
            aria-label="Back to cars"
          >
            <Link href="/cars">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
      />

      <PageContainer className="space-y-6 pb-10">
        {isLoading ? <CarDetailSkeleton /> : null}

        {!isLoading && notFound ? (
          <EmptyState
            icon={Compass}
            title="Vehicle not found"
            description="This car isn’t in your local garage anymore."
            action={
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/cars">Back to cars</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && car ? (
          <>
            <CarDetailView car={car} isActive={isActive} />

            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-tight">Actions</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  className="h-12 justify-start gap-3 rounded-xl"
                  variant="secondary"
                  onClick={() => setSheetOpen(true)}
                  disabled={busy}
                >
                  <Pencil className="size-4" />
                  Edit vehicle
                </Button>
                <Button
                  className="h-12 justify-start gap-3 rounded-xl"
                  variant="secondary"
                  onClick={handleSetActive}
                  disabled={busy || isActive}
                >
                  <Star className="size-4" />
                  {isActive ? "Already active" : "Set as active"}
                </Button>
                <Button
                  className="h-12 justify-start gap-3 rounded-xl"
                  variant="secondary"
                  onClick={handleDuplicate}
                  disabled={busy}
                >
                  <Copy className="size-4" />
                  Duplicate
                </Button>
                <Button
                  className="h-12 justify-start gap-3 rounded-xl text-destructive hover:text-destructive"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  disabled={busy}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </section>
          </>
        ) : null}
      </PageContainer>

      <CarFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        car={car}
        onSubmit={handleSubmit}
      />

      <DeleteCarDialog
        car={car}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          setDeleteOpen(false);
          void handleDelete();
        }}
      />
    </>
  );
}
