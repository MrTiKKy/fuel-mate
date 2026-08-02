"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDocumentFile } from "@/features/documents/repository";
import type { DocumentAttachment } from "@/types";

type AttachmentPreviewProps = {
  attachment: DocumentAttachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (attachmentId: string) => void;
};

export function AttachmentPreview({
  attachment,
  open,
  onOpenChange,
  onDelete,
}: AttachmentPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [mime, setMime] = useState<string>("");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      if (!attachment || !open) {
        setUrl(null);
        return;
      }
      const file = await getDocumentFile(attachment.id);
      if (!file || cancelled) return;
      objectUrl = URL.createObjectURL(file.blob);
      setUrl(objectUrl);
      setMime(file.mimeType);
    }

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment, open]);

  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <DialogTitle className="truncate pr-8 text-base">
            {attachment?.name ?? "Attachment"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 bg-black/90">
          {!url ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={attachment?.name ?? "Attachment"}
              className="h-full w-full object-contain"
            />
          ) : isPdf ? (
            <iframe
              title={attachment?.name ?? "PDF"}
              src={url}
              className="h-full w-full border-0"
            />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Preview not available for this file type.
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-border/60 p-3">
          <Button
            variant="secondary"
            className="h-11 flex-1 rounded-2xl"
            disabled={!url}
            onClick={() => {
              if (!url || !attachment) return;
              const anchor = window.document.createElement("a");
              anchor.href = url;
              anchor.download = attachment.name;
              anchor.click();
            }}
          >
            <Download className="size-4" />
            Download
          </Button>
          {onDelete && attachment ? (
            <Button
              variant="destructive"
              className="h-11 rounded-2xl"
              onClick={() => onDelete(attachment.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="h-11 rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
