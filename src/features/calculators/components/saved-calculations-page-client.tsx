"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Star } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveCalculationDialog } from "@/features/calculators/components/save-calculation-dialog";
import { SavedCalculationCard } from "@/features/calculators/components/saved-calculation-card";
import { CALCULATORS } from "@/features/calculators/constants";
import { useSavedCalculations } from "@/features/calculators/hooks/use-saved-calculations";
import type { CalculatorType, SavedCalculation } from "@/types";
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

export function SavedCalculationsPageClient() {
  const [filter, setFilter] = useState<CalculatorType | "all">("all");
  const { items, isLoading, rename, duplicate, remove, run } =
    useSavedCalculations(filter);

  const [renameTarget, setRenameTarget] = useState<SavedCalculation | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<SavedCalculation | null>(
    null,
  );

  const countLabel = useMemo(() => {
    if (isLoading) return "Loading…";
    if (items.length === 0) return "No saved calculations";
    return `${items.length} saved`;
  }, [isLoading, items.length]);

  return (
    <>
      <AppHeader
        title="Saved calculations"
        subtitle="Your named trip and cost estimates"
      />
      <PageContainer className="space-y-5 pb-10">
        <div className="flex items-center gap-3">
          <Select
            value={filter}
            onValueChange={(value) =>
              setFilter(value as CalculatorType | "all")
            }
          >
            <SelectTrigger className="h-11 flex-1 rounded-2xl">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All calculators</SelectItem>
              {CALCULATORS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="shrink-0 text-xs text-muted-foreground">{countLabel}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-3xl" />
            ))}
          </div>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No saved calculations yet"
            description="Tap the star on any calculator result to save it with a custom name — Cluj, Mamaia, Navetă serviciu…"
            action={
              <Button asChild className="h-11 rounded-2xl px-5">
                <Link href="/calculators">
                  <Calculator className="size-4" />
                  Open calculators
                </Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <SavedCalculationCard
                key={item.id}
                item={item}
                onRename={() => setRenameTarget(item)}
                onDuplicate={() => run(() => duplicate(item.id))}
                onDelete={() => setDeleteTarget(item)}
              />
            ))}
          </div>
        ) : null}
      </PageContainer>

      <SaveCalculationDialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        defaultName={renameTarget?.name ?? ""}
        mode="rename"
        onConfirm={async (name) => {
          if (!renameTarget) return;
          await rename(renameTarget.id, name);
          setRenameTarget(null);
        }}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete calculation?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              will be removed from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="h-11 rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteTarget) return;
                run(() => remove(deleteTarget.id));
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
