"use client";

import { useRef, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, animate } from "framer-motion";
import { cn } from "@/lib/utils";

const ACTION_WIDTH = 72;
const ACTIONS = 3;
const REVEAL_WIDTH = ACTION_WIDTH * ACTIONS;
const OPEN_THRESHOLD = 48;

export type SwipeAction = "edit" | "duplicate" | "delete";

type SwipeableRowProps = {
  children: React.ReactNode;
  onAction: (action: SwipeAction) => void;
  className?: string;
  disabled?: boolean;
};

export function SwipeableRow({
  children,
  onAction,
  className,
  disabled,
}: SwipeableRowProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);

  const snapTo = (target: number) => {
    void animate(x, target, {
      type: "spring",
      stiffness: 420,
      damping: 36,
      mass: 0.7,
    });
    setOpen(target < 0);
  };

  const close = () => snapTo(0);

  if (disabled || reduce) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative isolate overflow-hidden rounded-3xl", className)}>
      <div
        className="absolute inset-y-0 right-0 z-0 flex"
        style={{ width: REVEAL_WIDTH }}
        aria-hidden={!open}
      >
        <ActionButton
          label="Edit"
          icon={<Pencil className="size-4" />}
          className="bg-secondary text-secondary-foreground"
          onClick={() => {
            close();
            onAction("edit");
          }}
        />
        <ActionButton
          label="Duplicate"
          icon={<Copy className="size-4" />}
          className="bg-primary text-primary-foreground"
          onClick={() => {
            close();
            onAction("duplicate");
          }}
        />
        <ActionButton
          label="Delete"
          icon={<Trash2 className="size-4" />}
          className="bg-destructive text-white"
          onClick={() => {
            close();
            onAction("delete");
          }}
        />
      </div>

      {/* Opaque foreground so action colors never bleed through until swipe */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragEnd={(_, info) => {
          dragging.current = false;
          const offset = info.offset.x;
          const velocity = info.velocity.x;
          if (offset < -OPEN_THRESHOLD || velocity < -400) {
            snapTo(-REVEAL_WIDTH);
          } else if (offset > OPEN_THRESHOLD || velocity > 400) {
            snapTo(0);
          } else {
            snapTo(open ? -REVEAL_WIDTH : 0);
          }
        }}
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onClickCapture={(event) => {
          if (open && Math.abs(event.clientX - startX.current) < 4) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
        className="relative z-10 touch-pan-y will-change-transform rounded-3xl bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  className,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex w-[72px] flex-col items-center justify-center gap-1 text-[11px] font-semibold",
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}
