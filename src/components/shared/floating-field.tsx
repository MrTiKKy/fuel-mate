"use client";

import { useId, useState } from "react";
import { normalizeDecimalInput } from "@/lib/numbers";
import { cn } from "@/lib/utils";

type FloatingFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  type?: "number" | "text";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number;
  max?: number;
  step?: string | number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function FloatingField({
  label,
  value,
  onChange,
  suffix,
  type = "text",
  inputMode = "decimal",
  min,
  max,
  step = "any",
  placeholder = " ",
  disabled,
  className,
  id,
}: FloatingFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const floated = focused || value.trim() !== "";

  return (
    <div className={cn("relative", className)}>
      <input
        id={fieldId}
        type={type}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (inputMode === "decimal" || inputMode === "numeric") {
            const normalized = normalizeDecimalInput(value);
            if (normalized !== value) onChange(normalized);
          }
        }}
        className={cn(
          "peer h-14 w-full rounded-2xl border border-border/70 bg-card/60 px-4 pt-5 pb-2 text-base tabular-nums shadow-xs outline-none backdrop-blur-md transition-all duration-200",
          "placeholder:text-transparent",
          "focus-visible:border-primary/50 focus-visible:bg-card/80 focus-visible:ring-[3px] focus-visible:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          suffix && "pr-14",
        )}
      />
      <label
        htmlFor={fieldId}
        className={cn(
          "pointer-events-none absolute left-4 text-muted-foreground transition-all duration-200",
          floated
            ? "top-2 text-[11px] font-medium tracking-wide text-primary"
            : "top-1/2 -translate-y-1/2 text-sm",
        )}
      >
        {label}
      </label>
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs font-medium text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
