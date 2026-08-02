"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CarForm } from "@/features/cars/components/car-form";
import type { Car } from "@/types";
import type { CarFormValues } from "@/lib/validations/car";
import { carToFormValues } from "@/features/cars/utils";

type CarFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
  onSubmit: (values: CarFormValues) => Promise<void>;
};

export function CarFormSheet({
  open,
  onOpenChange,
  car,
  onSubmit,
}: CarFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(car);

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
            {isEditing ? "Edit vehicle" : "Add vehicle"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update details for this vehicle."
              : "Add a car to your garage. Everything stays on this device."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
          <div className="py-5">
            <CarForm
              key={car?.id ?? "new"}
              defaultValues={car ? carToFormValues(car) : undefined}
              submitLabel={isEditing ? "Save changes" : "Add vehicle"}
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
