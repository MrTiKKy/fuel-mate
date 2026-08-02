"use client";

import { FloatingActionButton } from "@/components/shared/floating-action-button";

type DocumentsFabProps = {
  onClick: () => void;
};

export function DocumentsFab({ onClick }: DocumentsFabProps) {
  return (
    <FloatingActionButton onClick={onClick} label="Upload document" />
  );
}
