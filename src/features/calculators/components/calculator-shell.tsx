"use client";

import { useMemo, useState } from "react";
import { Copy, RotateCcw, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { GlassCard } from "@/components/shared/glass-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { SaveCalculationDialog } from "@/features/calculators/components/save-calculation-dialog";
import type { CalculatorId } from "@/features/calculators/constants";
import * as savedRepo from "@/features/calculators/repository";
import { buildResultsClipboard } from "@/features/calculators/utils";
import { cn } from "@/lib/utils";
import type { SavedCalculationResult } from "@/types";

export type ResultRow = SavedCalculationResult;

type CalculatorShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  results: ResultRow[];
  onReset: () => void;
  canReset: boolean;
  clipboardTitle: string;
  calculatorType: CalculatorId;
  inputs: Record<string, string>;
  activeSavedId?: string | null;
  activeSavedName?: string | null;
  onSaved?: (id: string, name: string) => void;
};

export function CalculatorShell({
  title,
  subtitle,
  children,
  results,
  onReset,
  canReset,
  clipboardTitle,
  calculatorType,
  inputs,
  activeSavedId = null,
  activeSavedName = null,
  onSaved,
}: CalculatorShellProps) {
  const reduce = useReducedMotion();
  const hasResults = results.some((row) => row.value !== "—");
  const [saveOpen, setSaveOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = Boolean(activeSavedId);

  const copyResults = async () => {
    if (!hasResults) {
      toast.error("Enter values to copy results", {
        description: "Fill in the fields above first.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(
        buildResultsClipboard(clipboardTitle, results),
      );
      toast.success("Results copied", {
        description: "Paste anywhere you need them.",
        className: "toast-success-premium",
      });
    } catch {
      toast.error("Could not copy", {
        description: "Clipboard access was denied. Check browser permissions.",
      });
    }
  };

  const openSave = () => {
    if (!hasResults) {
      toast.error("Nothing to save yet", {
        description: "Enter values to generate results first.",
      });
      return;
    }
    setSaveOpen(true);
  };

  const handleSave = async (name: string) => {
    setIsSaving(true);
    try {
      if (activeSavedId) {
        const updated = await savedRepo.updateSavedCalculation(activeSavedId, {
          name,
          inputs,
          results,
        });
        onSaved?.(updated.id, updated.name);
        toast.success("Calculation updated", {
          description: updated.name,
        });
      } else {
        const created = await savedRepo.createSavedCalculation({
          calculatorType,
          name,
          inputs,
          results,
        });
        onSaved?.(created.id, created.name);
        toast.success("Calculation saved", {
          description: created.name,
        });
      }
      setSaveOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save calculation",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AppHeader title={title} subtitle={subtitle} />
      <PageContainer className="space-y-5 overflow-x-hidden pb-8">
        <GlassCard className="w-full space-y-3 p-4 md:p-5">{children}</GlassCard>

        <motion.div
          className="w-full space-y-3"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold tracking-tight">Results</h2>
              {/* Reserved line so “Saved as …” does not change header height */}
              <p
                className={cn(
                  "mt-0.5 h-4 truncate text-[11px] text-muted-foreground transition-opacity duration-200",
                  activeSavedName ? "opacity-100" : "opacity-0",
                )}
                aria-hidden={!activeSavedName}
              >
                {activeSavedName
                  ? `Saved as ${activeSavedName}`
                  : "Saved as placeholder"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant={isSaved ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-10 w-[5.75rem] rounded-xl px-3",
                  isSaved && "bg-primary text-primary-foreground",
                )}
                onClick={openSave}
                disabled={!hasResults}
                aria-label={
                  isSaved ? "Update saved calculation" : "Save calculation"
                }
              >
                <Star className={cn("size-3.5", isSaved && "fill-current")} />
                {isSaved ? "Update" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-3"
                onClick={onReset}
                disabled={!canReset}
                aria-label="Reset calculator"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-10 rounded-xl px-3"
                onClick={() => {
                  void copyResults();
                }}
                aria-label="Copy results"
              >
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2">
            {results.map((row, index) => (
              <ResultCard
                key={`${row.label}-${index}`}
                label={row.label}
                value={row.value}
                emphasize={row.emphasize}
                delay={index * 0.04}
                onStar={hasResults && row.emphasize ? openSave : undefined}
                isSaved={isSaved}
              />
            ))}
          </div>
        </motion.div>
      </PageContainer>

      <SaveCalculationDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        defaultName={activeSavedName ?? ""}
        mode={isSaved ? "update" : "save"}
        isSubmitting={isSaving}
        onConfirm={handleSave}
      />
    </>
  );
}

function ResultCard({
  label,
  value,
  emphasize,
  delay,
  onStar,
  isSaved,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  delay: number;
  onStar?: () => void;
  isSaved?: boolean;
}) {
  const reduce = useReducedMotion();
  const display = useMemo(() => value, [value]);
  const showStar = Boolean(emphasize);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, transform: "translateY(6px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ delay, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-card relative w-full min-w-0 rounded-3xl p-4",
        emphasize && "glass-card-highlight",
      )}
    >
      {/* Always reserve star slot on emphasized cards to keep width stable */}
      {showStar ? (
        <button
          type="button"
          onClick={onStar}
          disabled={!onStar}
          className={cn(
            "absolute top-3 right-3 flex size-9 items-center justify-center rounded-xl transition-[color,background-color,transform] duration-200",
            "text-muted-foreground hover:bg-primary/10 hover:text-primary active:scale-95",
            isSaved && "text-primary",
            !onStar && "pointer-events-none opacity-40",
          )}
          aria-label={isSaved ? "Update saved calculation" : "Save calculation"}
        >
          <Star className={cn("size-4", isSaved && "fill-current")} />
        </button>
      ) : null}
      <p
        className={cn(
          "text-xs font-medium tracking-wide text-muted-foreground",
          showStar && "pr-10",
        )}
      >
        {label}
      </p>
      <motion.p
        key={display}
        initial={reduce ? false : { opacity: 0.4, transform: "translateY(4px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        className={cn(
          "mt-1.5 text-2xl font-semibold tracking-tight tabular-nums",
          emphasize && "text-primary",
        )}
      >
        {display}
      </motion.p>
    </motion.div>
  );
}
