"use client";

import { FloatingActionButton } from "@/components/shared/floating-action-button";

type ServiceFabProps = {
  onClick: () => void;
  className?: string;
};

export function ServiceFab({ onClick, className }: ServiceFabProps) {
  return (
    <FloatingActionButton
      onClick={onClick}
      label="Add service"
      className={className}
    />
  );
}
