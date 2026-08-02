"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SaveCalculationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  mode?: "save" | "rename" | "update";
  isSubmitting?: boolean;
  onConfirm: (name: string) => Promise<void> | void;
};

export function SaveCalculationDialog({
  open,
  onOpenChange,
  defaultName = "",
  mode = "save",
  isSubmitting = false,
  onConfirm,
}: SaveCalculationDialogProps) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setError(null);
    }
  }, [open, defaultName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give this calculation a name");
      return;
    }
    if (trimmed.length > 60) {
      setError("Name is too long (max 60 characters)");
      return;
    }
    await onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
        <form onSubmit={(event) => void handleSubmit(event)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Star className="size-4 fill-current" />
              </span>
              {mode === "rename"
                ? "Rename calculation"
                : mode === "update"
                  ? "Update calculation"
                  : "Save calculation"}
            </DialogTitle>
            <DialogDescription>
              {mode === "rename"
                ? "Update the name for this saved result."
                : mode === "update"
                  ? "Save the latest inputs and results under this name."
                  : "Name it something memorable — Cluj, Mamaia, Navetă serviciu…"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Label htmlFor="saved-calc-name">Name</Label>
            <Input
              id="saved-calc-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="e.g. Brașov weekend"
              className="h-11 rounded-2xl"
              autoFocus
              maxLength={60}
            />
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-2xl"
              disabled={isSubmitting}
            >
              {mode === "rename"
                ? "Save name"
                : mode === "update"
                  ? "Update"
                  : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
