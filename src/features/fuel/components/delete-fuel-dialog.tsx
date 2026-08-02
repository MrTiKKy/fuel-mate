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
import { formatFuelDate } from "@/features/fuel/utils";
import type { FuelEntry } from "@/types";

type DeleteFuelDialogProps = {
  entry: FuelEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteFuelDialog({
  entry,
  open,
  onOpenChange,
  onConfirm,
}: DeleteFuelDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete fuel entry?</AlertDialogTitle>
          <AlertDialogDescription>
            {entry
              ? `Remove the fill-up from ${formatFuelDate(entry.date)}? Consumption for nearby full tanks will be recalculated.`
              : "This fuel entry will be permanently deleted."}
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
