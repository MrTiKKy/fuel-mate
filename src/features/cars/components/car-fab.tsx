"use client";

import { FloatingActionButton } from "@/components/shared/floating-action-button";

type CarFabProps = {
  onClick: () => void;
  className?: string;
};

export function CarFab({ onClick, className }: CarFabProps) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Add vehicle"
      className={className}
    />
  );
}
