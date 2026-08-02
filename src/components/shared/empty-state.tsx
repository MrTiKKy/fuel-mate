"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  suggestion?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  suggestion,
}: EmptyStateProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-card relative flex flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--glass-highlight),transparent_55%)]"
      />
      <motion.div
        initial={reduce ? false : { scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="relative mb-5 flex size-16 items-center justify-center rounded-3xl bg-primary/12 text-primary shadow-inner"
      >
        <Icon className="size-7" strokeWidth={1.6} />
      </motion.div>
      <h3 className="relative text-lg font-semibold tracking-tight">{title}</h3>
      <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {suggestion ? (
        <p className="relative mt-3 max-w-xs text-xs text-muted-foreground/80">
          {suggestion}
        </p>
      ) : null}
      {action ? <div className="relative mt-6">{action}</div> : null}
    </motion.div>
  );
}
