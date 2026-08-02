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
import type { ImportSummary } from "@/types";

type ImportSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  summary: ImportSummary;
  onConfirm: () => void;
};

export function ImportSummaryDialog({
  open,
  onOpenChange,
  fileName,
  summary,
  onConfirm,
}: ImportSummaryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Import backup?</AlertDialogTitle>
          <AlertDialogDescription>
            This will replace all local data with{" "}
            <span className="font-medium text-foreground">{fileName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-sm">
          <SummaryItem label="Cars" value={summary.cars} />
          <SummaryItem label="Fuel entries" value={summary.fuelEntries} />
          <SummaryItem label="Services" value={summary.serviceRecords} />
          <SummaryItem label="Documents" value={summary.documents} />
          <SummaryItem
            label="Settings"
            value={summary.settings ? "Yes" : "No"}
          />
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="h-11 rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction className="h-11 rounded-xl" onClick={onConfirm}>
            Import
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg bg-background/70 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
