"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDashboardDate,
  getGreeting,
} from "@/features/dashboard/selectors";
import { getCarDisplayName } from "@/features/cars/utils";
import type { Car } from "@/types";

type DashboardHeaderProps = {
  activeCar: Car | null;
};

export function DashboardHeader({ activeCar }: DashboardHeaderProps) {
  const greeting = getGreeting();
  const today = formatDashboardDate();

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-start justify-between gap-3 px-4 py-4 md:px-6">
        <div className="min-w-0 animate-[fade-in_0.35s_ease-out]">
          <p className="text-xs font-medium text-muted-foreground">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {greeting} 👋
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {activeCar
              ? getCarDisplayName(activeCar)
              : "Your garage awaits"}
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-xl"
          aria-label="Settings"
        >
          <Link href="/settings">
            <Settings className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
