"use client";

import { useCallback, useRef } from "react";

type LongPressOptions = {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
};

export function useLongPress({
  onLongPress,
  onClick,
  delay = 450,
}: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    longPressTriggered.current = false;
    clear();
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress();
    }, delay);
  }, [clear, delay, onLongPress]);

  const click = useCallback(() => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    onClick?.();
  }, [onClick]);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onClick: click,
    onContextMenu: (event: React.MouseEvent) => {
      event.preventDefault();
      onLongPress();
    },
  };
}
