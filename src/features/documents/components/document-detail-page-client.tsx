"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  NotebookPen,
  Paperclip,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AttachmentPreview } from "@/features/documents/components/attachment-preview";
import { DocumentFormSheet } from "@/features/documents/components/document-form-sheet";
import {
  buildDocumentReminder,
  deleteDocument,
  deleteDocumentAttachment,
  getDocument,
  getDocumentTypeLabel,
  updateDocument,
} from "@/features/documents/repository";
import { getCars } from "@/features/cars/repository";
import { getCarDisplayName } from "@/features/cars/utils";
import { formatServiceDate } from "@/features/service/utils";
import type { DocumentFormValues } from "@/features/documents/validations";
import type { Car, DocumentAttachment, VehicleDocument } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

type DocumentDetailPageClientProps = {
  documentId: string;
};

export function DocumentDetailPageClient({
  documentId,
}: DocumentDetailPageClientProps) {
  const router = useRouter();
  const [document, setDocument] = useState<VehicleDocument | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [preview, setPreview] = useState<DocumentAttachment | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [doc, nextCars] = await Promise.all([
        getDocument(documentId),
        getCars(),
      ]);
      setDocument(doc ?? null);
      setCars(nextCars);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const car = cars.find((item) => item.id === document?.vehicleId);
  const reminder = document ? buildDocumentReminder(document) : null;

  return (
    <>
      <AppHeader
        title="Document"
        subtitle={document?.title ?? "Details"}
        leading={
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/documents" aria-label="Back">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
        action={
          document ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setSheetOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-destructive"
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete document"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : null
        }
      />

      <PageContainer className="space-y-5 pb-10">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        ) : null}

        {!isLoading && !document ? (
          <EmptyState
            icon={FileText}
            title="Document not found"
            description="It may have been deleted."
            action={
              <Button asChild className="h-11 rounded-2xl px-5">
                <Link href="/documents">Back to Documents</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && document ? (
          <>
            <div className="rounded-3xl border border-border/60 bg-card/90 p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-lg">
                  {getDocumentTypeLabel(document.type)}
                </Badge>
                {reminder ? (
                  <Badge className="rounded-lg capitalize">
                    {reminder.status.replace("_", " ")}
                  </Badge>
                ) : null}
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">
                {document.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {car ? getCarDisplayName(car) : "Unknown vehicle"}
              </p>
            </div>

            <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/90">
              <Row
                icon={Calendar}
                label="Issue date"
                value={
                  document.issueDate
                    ? formatServiceDate(document.issueDate)
                    : "—"
                }
              />
              <Separator />
              <Row
                icon={Calendar}
                label="Expiry date"
                value={
                  document.expiryDate
                    ? formatServiceDate(document.expiryDate)
                    : "—"
                }
              />
              <Separator />
              <Row
                icon={FileText}
                label="Issuer"
                value={document.issuer || "—"}
              />
            </section>

            <section className="space-y-3">
              <h3 className="px-1 text-sm font-semibold">Attachments</h3>
              {document.attachments.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  No files yet. Edit to upload.
                </p>
              ) : (
                <div className="grid gap-2">
                  {document.attachments.map((attachment) => (
                    <button
                      key={attachment.id}
                      type="button"
                      onClick={() => setPreview(attachment)}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 text-left active:scale-[0.99]"
                    >
                      <Paperclip className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {attachment.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(0)} KB
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/90 px-4 py-4">
              <p className="flex gap-3 text-sm leading-relaxed">
                <NotebookPen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {document.notes || "No notes."}
              </p>
            </section>
          </>
        ) : null}
      </PageContainer>

      {document ? (
        <DocumentFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          cars={cars}
          document={document}
          onSubmit={async (values: DocumentFormValues, files) => {
            await updateDocument(
              document.id,
              {
                vehicleId: values.vehicleId,
                type: values.type,
                title: values.title.trim(),
                issueDate: values.issueDate || undefined,
                expiryDate: values.expiryDate || undefined,
                issuer: values.issuer.trim() || undefined,
                notes: values.notes.trim() || undefined,
              },
              files,
            );
            toast.success("Document updated");
            await refresh();
          }}
        />
      ) : null}

      <AttachmentPreview
        attachment={preview}
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        onDelete={async (attachmentId) => {
          if (!document) return;
          await deleteDocumentAttachment(document.id, attachmentId);
          toast.success("Attachment deleted");
          setPreview(null);
          await refresh();
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the document and all attachments from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!document) return;
                await deleteDocument(document.id);
                toast.success("Document deleted");
                router.replace("/documents");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="size-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
