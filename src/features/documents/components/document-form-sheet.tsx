"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DocumentForm } from "@/features/documents/components/document-form";
import { getDocumentTypeLabel } from "@/features/documents/repository";
import type { DocumentFormValues } from "@/features/documents/validations";
import type { Car, VehicleDocument } from "@/types";

type DocumentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cars: Car[];
  document?: VehicleDocument | null;
  defaultVehicleId?: string;
  onSubmit: (values: DocumentFormValues, files: File[]) => Promise<void>;
};

export function DocumentFormSheet({
  open,
  onOpenChange,
  cars,
  document,
  defaultVehicleId,
  onSubmit,
}: DocumentFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(document);

  useEffect(() => {
    if (!open) setIsSubmitting(false);
  }, [open]);

  const defaults: Partial<DocumentFormValues> | undefined = document
    ? {
        vehicleId: document.vehicleId,
        type: document.type,
        title: document.title,
        issueDate: document.issueDate?.slice(0, 10) ?? "",
        expiryDate: document.expiryDate?.slice(0, 10) ?? "",
        issuer: document.issuer ?? "",
        notes: document.notes ?? "",
      }
    : {
        vehicleId: defaultVehicleId ?? cars[0]?.id,
        type: "insurance_rca",
        title: getDocumentTypeLabel("insurance_rca"),
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
            {isEditing ? "Edit document" : "Upload document"}
          </SheetTitle>
          <SheetDescription>
            Stored only on this device. Cloud sync can be added later.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
          <div className="py-5">
            {cars.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Add a vehicle first before uploading documents.
              </p>
            ) : (
              <DocumentForm
                key={document?.id ?? `new-${defaults?.vehicleId}`}
                cars={cars}
                defaultValues={defaults}
                requireFiles={!isEditing}
                submitLabel={isEditing ? "Save changes" : "Upload document"}
                isSubmitting={isSubmitting}
                onCancel={() => onOpenChange(false)}
                onSubmit={async (values, files) => {
                  setIsSubmitting(true);
                  try {
                    await onSubmit(values, files);
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
