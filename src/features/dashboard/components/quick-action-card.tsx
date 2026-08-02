"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  className?: string;
};

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  className,
}: QuickActionCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <Link
        href={href}
        className={cn(
          "glass-card group flex min-h-[7.5rem] flex-col justify-between overflow-hidden rounded-3xl p-4",
          className,
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold tracking-tight">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
