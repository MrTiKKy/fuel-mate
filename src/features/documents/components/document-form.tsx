"use client";

import { useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCEPTED_DOCUMENT_ACCEPT,
  ACCEPTED_DOCUMENT_MIME,
  DOCUMENT_TYPE_OPTIONS,
  MAX_DOCUMENT_FILE_BYTES,
} from "@/features/documents/constants";
import { getDocumentTypeLabel } from "@/features/documents/repository";
import {
  documentFormSchema,
  type DocumentFormValues,
} from "@/features/documents/validations";
import { getCarDisplayName } from "@/features/cars/utils";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

const fieldClass =
  "h-12 rounded-2xl border-border/80 bg-muted/40 px-4 text-base md:text-base";

type DocumentFormProps = {
  cars: Car[];
  defaultValues?: Partial<DocumentFormValues>;
  submitLabel?: string;
  onSubmit: (values: DocumentFormValues, files: File[]) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  requireFiles?: boolean;
};

export function DocumentForm({
  cars,
  defaultValues,
  submitLabel = "Save document",
  onSubmit,
  onCancel,
  isSubmitting = false,
  requireFiles = false,
}: DocumentFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      vehicleId: defaultValues?.vehicleId ?? cars[0]?.id ?? "",
      type: defaultValues?.type ?? "insurance_rca",
      title:
        defaultValues?.title ??
        getDocumentTypeLabel(defaultValues?.type ?? "insurance_rca"),
      issueDate: defaultValues?.issueDate ?? "",
      expiryDate: defaultValues?.expiryDate ?? "",
      issuer: defaultValues?.issuer ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next: File[] = [];
    for (const file of Array.from(list)) {
      if (
        !ACCEPTED_DOCUMENT_MIME.includes(
          file.type as (typeof ACCEPTED_DOCUMENT_MIME)[number],
        )
      ) {
        setFileError("Only PDF, JPEG, PNG, and WEBP files are allowed.");
        continue;
      }
      if (file.size > MAX_DOCUMENT_FILE_BYTES) {
        setFileError("Each file must be under 12 MB.");
        continue;
      }
      next.push(file);
    }
    if (next.length) {
      setFiles((prev) => [...prev, ...next]);
      setFileError(null);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          if (requireFiles && files.length === 0) {
            setFileError("Add at least one file.");
            return;
          }
          await onSubmit(values, files);
        })}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className={cn(fieldClass, "w-full")}>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {getCarDisplayName(car)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (!defaultValues?.title) {
                    form.setValue(
                      "title",
                      getDocumentTypeLabel(
                        value as DocumentFormValues["type"],
                      ),
                    );
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className={cn(fieldClass, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input className={fieldClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue date</FormLabel>
                <FormControl>
                  <Input type="date" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry date</FormLabel>
                <FormControl>
                  <Input type="date" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="issuer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuer</FormLabel>
              <FormControl>
                <Input
                  placeholder="Company or authority"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24 rounded-2xl border-border/80 bg-muted/40 px-4 py-3 text-base"
                  placeholder="Optional notes…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Attachments
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <FileUp className="size-6 text-primary" />
            <span className="text-sm font-medium">Upload PDF or images</span>
            <span className="text-xs text-muted-foreground">
              PDF, JPEG, PNG, WEBP · up to 12 MB each
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_DOCUMENT_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 px-3 py-2.5 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    aria-label="Remove file"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {fileError ? (
            <p className="text-sm text-destructive">{fileError}</p>
          ) : null}
        </div>

        <div className="sticky bottom-0 -mx-1 flex gap-3 bg-background/95 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            className="h-12 flex-1 rounded-2xl"
            disabled={isSubmitting || cars.length === 0}
            loading={isSubmitting}
          >
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
