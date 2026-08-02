"use client";

import { FloatingActionButton } from "@/components/shared/floating-action-button";

type FuelFabProps = {
  onClick: () => void;
  className?: string;
};

export function FuelFab({ onClick, className }: FuelFabProps) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Add fuel entry"
      className={className}
    />
  );
}
