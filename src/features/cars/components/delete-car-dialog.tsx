"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCarDisplayName } from "@/features/cars/utils";
import type { Car } from "@/types";

type DeleteCarDialogProps = {
  car: Car | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteCarDialog({
  car,
  open,
  onOpenChange,
  onConfirm,
}: DeleteCarDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete vehicle?</AlertDialogTitle>
          <AlertDialogDescription>
            {car
              ? `“${getCarDisplayName(car)}” and its local links will be removed. Fuel and service history for this car will no longer be associated. This can’t be undone.`
              : "This vehicle will be permanently deleted from this device."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="h-11 rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="h-11 rounded-xl bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
