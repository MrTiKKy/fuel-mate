"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FuelForm } from "@/features/fuel/components/fuel-form";
import { getPreviousOdometer } from "@/features/fuel/repository";
import { fuelEntryToFormValues } from "@/features/fuel/utils";
import type { FuelEntryFormValues } from "@/lib/validations/fuel";
import type { Car, FuelEntry } from "@/types";

type FuelFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cars: Car[];
  entry?: FuelEntry | null;
  defaultCarId?: string;
  onSubmit: (values: FuelEntryFormValues) => Promise<void>;
};

export function FuelFormSheet({
  open,
  onOpenChange,
  cars,
  entry,
  defaultCarId,
  onSubmit,
}: FuelFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minOdometer, setMinOdometer] = useState<number | undefined>();
  const [ready, setReady] = useState(false);
  const isEditing = Boolean(entry);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    const carId = entry?.carId ?? defaultCarId ?? cars[0]?.id;
    if (!carId) {
      setMinOdometer(undefined);
      setReady(true);
      return;
    }

    let cancelled = false;
    void getPreviousOdometer(carId, entry?.id).then((value) => {
      if (cancelled) return;
      setMinOdometer(value);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [open, entry, defaultCarId, cars]);

  const defaults: Partial<FuelEntryFormValues> | undefined = entry
    ? fuelEntryToFormValues(entry)
    : {
        carId: defaultCarId ?? cars[0]?.id,
        date: new Date().toISOString().slice(0, 10),
        fuelType: cars.find((c) => c.id === (defaultCarId ?? cars[0]?.id))
          ?.fuelType,
        isFullTank: true,
        odometer: minOdometer?.toString() ?? "",
      };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className="flex h-[92dvh] max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-3xl border-border/70 p-0 sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-border/60 px-5 pt-5 pb-4 text-left">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
          <SheetTitle className="pr-8 text-xl">
            {isEditing ? "Edit fuel entry" : "Add fuel entry"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update this fill-up. Consumption recalculates for full tanks."
              : "Log a fill-up. Full tanks unlock consumption between stops."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
          <div className="py-5">
            {cars.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Add a vehicle first before logging fuel.
              </p>
            ) : !ready ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Preparing form…
              </p>
            ) : (
              <FuelForm
                key={entry?.id ?? `new-${defaults?.carId}`}
                cars={cars}
                defaultValues={defaults}
                minOdometer={isEditing ? undefined : minOdometer}
                submitLabel={isEditing ? "Save changes" : "Add entry"}
                isSubmitting={isSubmitting}
                onCancel={() => onOpenChange(false)}
                onSubmit={async (values) => {
                  setIsSubmitting(true);
                  try {
                    await onSubmit(values);
                    onOpenChange(false);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              />
            )}          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
