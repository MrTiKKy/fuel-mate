"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Star, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  getCalculatorHref,
  getCalculatorMeta,
} from "@/features/calculators/constants";
import { SwipeableRow, type SwipeAction } from "@/components/shared/swipeable-row";
import { cn } from "@/lib/utils";
import type { SavedCalculation } from "@/types";

type SavedCalculationCardProps = {
  item: SavedCalculation;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function SavedCalculationCard({
  item,
  onRename,
  onDuplicate,
  onDelete,
}: SavedCalculationCardProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const meta = getCalculatorMeta(item.calculatorType);
  const Icon = meta?.icon ?? Star;
  const highlight =
    item.results.find((row) => row.emphasize) ?? item.results[0];
  const href = getCalculatorHref(item.calculatorType, item.id);

  const handleAction = (action: SwipeAction) => {
    if (action === "edit") onRename();
    if (action === "duplicate") onDuplicate();
    if (action === "delete") onDelete();
  };

  return (
    <SwipeableRow onAction={handleAction}>
      <motion.article
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/60 bg-surface-elevated p-4"
      >
        <button
          type="button"
          className="w-full text-left active:scale-[0.99]"
          onClick={() => router.push(href)}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold tracking-tight">
                  {item.name}
                </span>
                <Star className="size-3.5 shrink-0 fill-primary text-primary" />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {meta?.title ?? item.calculatorType}
              </span>
              {highlight ? (
                <span
                  className={cn(
                    "mt-2 block text-lg font-semibold tracking-tight tabular-nums",
                    highlight.emphasize !== false && "text-primary",
                  )}
                >
                  {highlight.value}
                </span>
              ) : null}
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Updated{" "}
                {new Date(item.updatedAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
        </button>

        <div className="mt-3 flex gap-2 border-t border-border/50 pt-3">
          <ActionChip href={href} label="Open" />
          <button
            type="button"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted/60 text-xs font-medium"
            onClick={onRename}
          >
            <Pencil className="size-3.5" />
            Rename
          </button>
          <button
            type="button"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted/60 text-xs font-medium"
            onClick={onDuplicate}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </motion.article>
    </SwipeableRow>
  );
}

function ActionChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-primary/12 text-xs font-medium text-primary"
    >
      {label}
    </Link>
  );
}
