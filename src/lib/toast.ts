"use client";

import { toast } from "sonner";

/** Subtle success feedback with optional confetti burst in the toast UI. */
export function toastSuccess(
  message: string,
  description?: string,
  options?: { confetti?: boolean },
) {
  toast.success(message, {
    description,
    className: options?.confetti === false ? undefined : "toast-success-premium",
  });
}

export function toastError(message: string, suggestion?: string) {
  toast.error(message, {
    description: suggestion ?? "Try again, or check your input and connection.",
  });
}
