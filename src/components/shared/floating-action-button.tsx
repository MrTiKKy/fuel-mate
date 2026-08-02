"use client";

import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type FloatingActionButtonProps = {
  onClick: () => void;
  label: string;
  className?: string;
  icon?: React.ReactNode;
};

export function FloatingActionButton({
  onClick,
  label,
  className,
  icon,
}: FloatingActionButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      initial={reduce ? false : { scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={cn(
        "fixed z-40 flex size-14 items-center justify-center rounded-2xl",
        "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
        "right-4 bottom-[calc(var(--nav-height)+1.75rem+env(safe-area-inset-bottom,0px))] md:right-8 md:bottom-8",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      {icon ?? <Plus className="size-6" strokeWidth={2.25} />}
    </motion.button>
  );
}
