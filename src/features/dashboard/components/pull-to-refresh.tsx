"use client";

import { useCallback, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  className?: string;
};

const THRESHOLD = 64;

export function PullToRefresh({
  onRefresh,
  isRefreshing = false,
  children,
  className,
}: PullToRefreshProps) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const [armed, setArmed] = useState(false);

  const reset = useCallback(() => {
    pulling.current = false;
    setArmed(false);
  }, []);

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={(event) => {
        if (window.scrollY > 0 || isRefreshing) return;
        startY.current = event.touches[0].clientY;
        pulling.current = true;
      }}
      onTouchMove={(event) => {
        if (!pulling.current || isRefreshing) return;
        const dy = event.touches[0].clientY - startY.current;
        setArmed(dy >= THRESHOLD && window.scrollY <= 0);
      }}
      onTouchEnd={() => {
        if (!pulling.current) return;
        const shouldRefresh = armed;
        reset();
        if (shouldRefresh) {
          void onRefresh();
        }
      }}
      onTouchCancel={reset}
    >
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden transition-all duration-200",
          isRefreshing || armed ? "h-10 opacity-100" : "h-0 opacity-0",
        )}
        aria-hidden={!isRefreshing && !armed}
      >
        <LoaderCircle
          className={cn(
            "size-5 text-primary",
            (isRefreshing || armed) && "animate-spin",
          )}
        />
      </div>
      {children}
    </div>
  );
}
