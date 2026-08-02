"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, FileWarning, FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { getDocumentTypeLabel } from "@/features/documents/repository";
import { cn } from "@/lib/utils";
import type { DocumentReminder, DocumentType } from "@/types";

type DocumentsDashboardSectionProps = {
  reminders: DocumentReminder[];
  missingTypes: DocumentType[];
};

export function DocumentsDashboardSection({
  reminders,
  missingTypes,
}: DocumentsDashboardSectionProps) {
  const expired = reminders.filter((item) => item.status === "overdue");
  const soon = reminders.filter(
    (item) => item.status === "due_soon" || item.status === "upcoming",
  );

  const hasContent =
    expired.length > 0 || soon.length > 0 || missingTypes.length > 0;

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Documents"
        action={
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-2 text-xs"
          >
            <Link href="/documents">Open</Link>
          </Button>
        }
      />

      {!hasContent ? (
        <EmptyState
          icon={FileWarning}
          title="Upload your first vehicle document."
          description="Insurance, ITP, and licenses stay available offline."
          action={
            <Button asChild className="h-11 rounded-2xl px-5">
              <Link href="/documents">Upload Document</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {expired.map((item) => (
            <DocRow
              key={item.id}
              href={`/documents/${item.documentId}`}
              title={item.title}
              subtitle={`Expired ${Math.abs(item.daysRemaining)} days ago`}
              tone="overdue"
              icon={<FileX2 className="size-4" />}
            />
          ))}
          {soon.map((item) => (
            <DocRow
              key={item.id}
              href={`/documents/${item.documentId}`}
              title={item.title}
              subtitle={
                item.daysRemaining < 0
                  ? "Expired"
                  : `Expires in ${item.daysRemaining} days`
              }
              tone="soon"
              icon={<AlertTriangle className="size-4" />}
            />
          ))}
          {missingTypes.slice(0, 3).map((type) => (
            <DocRow
              key={type}
              href="/documents"
              title={`Missing ${getDocumentTypeLabel(type)}`}
              subtitle="Recommended for a complete garage"
              tone="missing"
              icon={<FileWarning className="size-4" />}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DocRow({
  href,
  title,
  subtitle,
  tone,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  tone: "overdue" | "soon" | "missing";
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3.5 active:scale-[0.99]",
        tone === "overdue" &&
          "border-destructive/30 bg-destructive/8",
        tone === "soon" && "border-warning/30 bg-warning/10",
        tone === "missing" && "border-border/60 bg-card/90",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
          tone === "overdue" && "bg-destructive/15 text-destructive",
          tone === "soon" && "bg-warning/20 text-warning",
          tone === "missing" && "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
