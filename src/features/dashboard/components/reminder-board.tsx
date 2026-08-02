"use client";

import Link from "next/link";
import { AlertTriangle, Bell, Clock3, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { cn } from "@/lib/utils";
import type { ServiceReminder } from "@/types";

type ReminderBoardProps = {
  reminders: ServiceReminder[];
};

export function ReminderBoard({ reminders }: ReminderBoardProps) {
  const overdue = reminders.filter((item) => item.status === "overdue");
  const dueSoon = reminders.filter((item) => item.status === "due_soon");
  const upcoming = reminders.filter((item) => item.status === "upcoming");

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Service reminders"
        action={
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-2 text-xs"
          >
            <Link href="/service">See all</Link>
          </Button>
        }
      />

      {reminders.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No reminders yet"
          description="Add a service entry with a repeat interval — oil, ITP, insurance, tyres."
          action={
            <Button asChild variant="secondary" className="h-11 rounded-2xl px-5">
              <Link href="/service">Open Service</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <ReminderGroup
            title="Overdue"
            icon={<AlertTriangle className="size-3.5" />}
            tone="overdue"
            items={overdue}
          />
          <ReminderGroup
            title="Due soon"
            icon={<Bell className="size-3.5" />}
            tone="due_soon"
            items={dueSoon}
          />
          <ReminderGroup
            title="Upcoming"
            icon={<Clock3 className="size-3.5" />}
            tone="upcoming"
            items={upcoming}
          />
        </div>
      )}
    </section>
  );
}

function ReminderGroup({
  title,
  icon,
  tone,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "overdue" | "due_soon" | "upcoming";
  items: ServiceReminder[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-lg",
            tone === "overdue" && "bg-destructive/15 text-destructive",
            tone === "due_soon" && "bg-warning/20 text-warning",
            tone === "upcoming" && "bg-primary/15 text-primary",
          )}
        >
          {icon}
        </span>
        {title}
        <span className="tabular-nums text-muted-foreground/80">
          {items.length}
        </span>
      </div>
      <div className="grid gap-2">
        {items.map((item) => {
          const parts: string[] = [];
          if (item.daysRemaining !== null) {
            parts.push(
              item.daysRemaining < 0
                ? `${Math.abs(item.daysRemaining)}d overdue`
                : `${item.daysRemaining}d left`,
            );
          }
          if (item.kmRemaining !== null) {
            parts.push(
              item.kmRemaining < 0
                ? `${Math.abs(Math.round(item.kmRemaining))} km overdue`
                : `${Math.round(item.kmRemaining)} km left`,
            );
          }

          return (
            <Link
              key={item.id}
              href={`/service/${item.recordId}`}
              className={cn(
                "rounded-2xl border px-4 py-3.5 transition-colors active:scale-[0.99]",
                tone === "overdue" &&
                  "border-destructive/30 bg-destructive/8 hover:border-destructive/50",
                tone === "due_soon" &&
                  "border-warning/30 bg-warning/10 hover:border-warning/50",
                tone === "upcoming" &&
                  "border-border/60 bg-card/90 hover:border-primary/30",
              )}
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {parts.join(" · ") || "Reminder set"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
