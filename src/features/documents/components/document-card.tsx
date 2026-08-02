"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, FileText, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildDocumentReminder, getDocumentTypeLabel } from "@/features/documents/repository";
import { formatServiceDate } from "@/features/service/utils";
import { cn } from "@/lib/utils";
import type { VehicleDocument } from "@/types";

type DocumentCardProps = {
  document: VehicleDocument;
  vehicleName?: string;
  onOpen: (document: VehicleDocument) => void;
};

export function DocumentCard({
  document,
  vehicleName,
  onOpen,
}: DocumentCardProps) {
  const router = useRouter();
  const reminder = buildDocumentReminder(document);

  return (
    <button
      type="button"
      onClick={() => {
        onOpen(document);
        router.push(`/documents/${document.id}`);
      }}
      className={cn(
        "w-full rounded-3xl border border-border/60 bg-card/90 p-4 text-left backdrop-blur-md transition-transform active:scale-[0.99]",
        "animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <FileText className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-lg text-[10px]">
              {getDocumentTypeLabel(document.type)}
            </Badge>
            {reminder ? (
              <Badge
                className={cn(
                  "rounded-lg text-[10px] hover:bg-inherit",
                  reminder.status === "overdue" &&
                    "bg-destructive/15 text-destructive",
                  reminder.status === "due_soon" &&
                    "bg-warning/20 text-warning",
                  reminder.status === "upcoming" &&
                    "bg-primary/15 text-primary",
                )}
              >
                {reminder.status === "overdue"
                  ? "Expired"
                  : reminder.status === "due_soon"
                    ? "Due soon"
                    : "Expiring"}
              </Badge>
            ) : null}
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold tracking-tight">
            {document.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {vehicleName ?? "Vehicle"}
            {document.issuer ? ` · ${document.issuer}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarClock className="size-3.5" />
          {document.expiryDate
            ? `Expires ${formatServiceDate(document.expiryDate)}`
            : "No expiry"}
        </span>
        <span className="flex items-center gap-1">
          <Paperclip className="size-3.5" />
          {document.attachments.length}
        </span>
      </div>
    </button>
  );
}
