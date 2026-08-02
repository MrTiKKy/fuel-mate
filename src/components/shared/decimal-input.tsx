"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { normalizeDecimalInput } from "@/lib/numbers";
import { cn } from "@/lib/utils";

type DecimalInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "onChange" | "value"
> & {
  value: string;
  onChange: (value: string) => void;
  /** Normalize commas to dots on blur (default true) */
  normalizeOnBlur?: boolean;
};

/**
 * Mobile-friendly decimal input.
 * Uses text + inputMode=decimal so iOS accepts "5,5" and "5.5".
 */
export function DecimalInput({
  value,
  onChange,
  normalizeOnBlur = true,
  className,
  onBlur,
  ...props
}: DecimalInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      enterKeyHint="next"
      autoComplete="off"
      value={value}
      className={cn(className)}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      onBlur={(event) => {
        if (normalizeOnBlur) {
          const normalized = normalizeDecimalInput(event.target.value);
          if (normalized !== event.target.value) {
            onChange(normalized);
          }
        }
        onBlur?.(event);
      }}
      {...props}
    />
  );
}
