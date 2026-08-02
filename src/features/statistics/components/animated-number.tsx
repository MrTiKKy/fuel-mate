"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedNumberProps = {
  value: number;
  format?: (value: number) => string;
  className?: string;
  durationMs?: number;
};

export function AnimatedNumber({
  value,
  format = (v) => v.toLocaleString(),
  className,
  durationMs = 700,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const from = display;
    const delta = value - from;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + delta * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate when value changes only
  }, [value, durationMs]);

  return <span className={cn(className)}>{format(display)}</span>;
}
