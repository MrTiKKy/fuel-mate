"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ServiceForm } from "@/features/service/components/service-form";
import {
  formValuesToServiceInput,
  serviceToFormValues,
} from "@/features/service/utils";
import { SERVICE_TYPE_OPTIONS } from "@/features/service/constants";
import type { ServiceFormValues } from "@/lib/validations/service";
import type { Car, ServiceRecord } from "@/types";

type ServiceFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cars: Car[];
  record?: ServiceRecord | null;
  defaultCarId?: string;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
};

export function ServiceFormSheet({
  open,
  onOpenChange,
  cars,
  record,
  defaultCarId,
  onSubmit,
}: ServiceFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(record);

  const defaults: Partial<ServiceFormValues> | undefined = record
    ? serviceToFormValues(record)
    : {
        carId: defaultCarId ?? cars[0]?.id,
        type: "oil_change",
        title: SERVICE_TYPE_OPTIONS[0]?.label ?? "Oil Change",
        dateCompleted: new Date().toISOString().slice(0, 10),
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
            {isEditing ? "Edit service" : "Add service"}
          </SheetTitle>
          <SheetDescription>
            Track maintenance and set the next date or mileage reminder.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
          <div className="py-5">
            {cars.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Add a vehicle before logging service.
              </p>
            ) : (
              <ServiceForm
                key={record?.id ?? `new-${defaults?.carId}`}
                cars={cars}
                defaultValues={defaults}
                submitLabel={isEditing ? "Save changes" : "Add service"}
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
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { formValuesToServiceInput };
