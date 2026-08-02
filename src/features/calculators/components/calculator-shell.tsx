"use client";

import { useMemo } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { GlassCard } from "@/components/shared/glass-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { buildResultsClipboard } from "@/features/calculators/utils";
import { cn } from "@/lib/utils";

type ResultRow = {
  label: string;
  value: string;
  emphasize?: boolean;
};

type CalculatorShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  results: ResultRow[];
  onReset: () => void;
  canReset: boolean;
  clipboardTitle: string;
};

export function CalculatorShell({
  title,
  subtitle,
  children,
  results,
  onReset,
  canReset,
  clipboardTitle,
}: CalculatorShellProps) {
  const reduce = useReducedMotion();
  const hasResults = results.some((row) => row.value !== "—");

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

  return (
    <>
      <AppHeader title={title} subtitle={subtitle} />
      <PageContainer className="space-y-5 pb-8">
        <GlassCard className="space-y-3 p-4 md:p-5">{children}</GlassCard>

        <motion.div
          layout={!reduce}
          className="space-y-3"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
            <div className="flex items-center justify-between gap-3 px-1">
              <h2 className="text-sm font-semibold tracking-tight">Results</h2>
              <div className="flex gap-2">
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

            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((row, index) => (
                <ResultCard
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  emphasize={row.emphasize}
                  delay={index * 0.04}
                />
              ))}
            </div>
          </motion.div>
      </PageContainer>
    </>
  );
}

function ResultCard({
  label,
  value,
  emphasize,
  delay,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const display = useMemo(() => value, [value]);

  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-card rounded-3xl p-4",
        emphasize && "glass-card-highlight",
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <motion.p
        key={display}
        initial={reduce ? false : { opacity: 0.4, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
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
