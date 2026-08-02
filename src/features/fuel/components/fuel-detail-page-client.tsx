"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Pencil, Trash2, Compass } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { DeleteFuelDialog } from "@/features/fuel/components/delete-fuel-dialog";
import { FuelDetailSkeleton } from "@/features/fuel/components/fuel-skeletons";
import { FuelDetailView } from "@/features/fuel/components/fuel-detail-view";
import { FuelFormSheet } from "@/features/fuel/components/fuel-form-sheet";
import { useFuelEntry } from "@/features/fuel/hooks/use-fuel-entry";
import {
  createFuelEntry,
  deleteFuelEntry,
  updateFuelEntry,
} from "@/features/fuel/repository";
import {
  duplicateFuelEntryInput,
  formValuesToFuelInput,
} from "@/features/fuel/utils";
import { getCars } from "@/features/cars/repository";
import type { FuelEntryFormValues } from "@/lib/validations/fuel";
import type { Car } from "@/types";
import { useEffect } from "react";

type FuelDetailPageClientProps = {
  entryId: string;
};

export function FuelDetailPageClient({ entryId }: FuelDetailPageClientProps) {
  const router = useRouter();
  const { entry, car, isLoading, notFound, refresh } = useFuelEntry(entryId);
  const [cars, setCars] = useState<Car[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getCars().then(setCars);
  }, []);

  const handleSubmit = async (values: FuelEntryFormValues) => {
    if (!entry) return;
    await updateFuelEntry(entry.id, formValuesToFuelInput(values));
    toast.success("Fuel entry updated");
    await refresh();
  };

  const handleDuplicate = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      const copy = await createFuelEntry(duplicateFuelEntryInput(entry));
      toast.success("Fuel entry duplicated");
      router.push(`/fuel/${copy.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      await deleteFuelEntry(entry.id);
      toast.success("Fuel entry deleted");
      router.replace("/fuel");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Fuel entry"
        subtitle={car ? `${car.brand} ${car.model}` : undefined}
        leading={
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl"
            aria-label="Back to fuel log"
          >
            <Link href="/fuel">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
      />

      <PageContainer className="space-y-6 pb-10">
        {isLoading ? <FuelDetailSkeleton /> : null}

        {!isLoading && notFound ? (
          <EmptyState
            icon={Compass}
            title="Entry not found"
            description="This fuel stop isn’t in your local log anymore."
            action={
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/fuel">Back to fuel log</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && entry ? (
          <>
            <FuelDetailView entry={entry} car={car} />

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
                  Edit entry
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
                  className="h-12 justify-start gap-3 rounded-xl text-destructive hover:text-destructive sm:col-span-2"
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

      <FuelFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cars={cars}
        entry={entry}
        onSubmit={handleSubmit}
      />

      <DeleteFuelDialog
        entry={entry}
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
