"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  highlight?: boolean;
};

export function GlassCard({
  children,
  className,
  interactive = false,
  highlight = false,
}: GlassCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={
        interactive && !reduce ? { y: -2, scale: 1.01 } : undefined
      }
      whileTap={interactive && !reduce ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "glass-card relative overflow-hidden rounded-3xl",
        highlight && "glass-card-highlight",
        interactive && "cursor-pointer",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
