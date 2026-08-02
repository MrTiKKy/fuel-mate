"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentCard } from "@/features/documents/components/document-card";
import { DocumentFormSheet } from "@/features/documents/components/document-form-sheet";
import { DocumentsFab } from "@/features/documents/components/documents-fab";
import { DOCUMENT_TYPE_OPTIONS } from "@/features/documents/constants";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import type { DocumentSort } from "@/features/documents/selectors";
import { getCarDisplayName } from "@/features/cars/utils";
import type { DocumentFormValues } from "@/features/documents/validations";
import type { DocumentType, VehicleDocument } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function DocumentsPageClient() {
  const {
    cars,
    filtered,
    filters,
    updateFilters,
    isLoading,
    createDocument,
  } = useDocuments();

  const [sheetOpen, setSheetOpen] = useState(false);

  const carNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const car of cars) map.set(car.id, getCarDisplayName(car));
    return map;
  }, [cars]);

  const handleSubmit = async (values: DocumentFormValues, files: File[]) => {
    await createDocument(
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
  };

  return (
    <>
      <AppHeader
        title="Documents"
        subtitle="Your digital garage vault"
      />
      <PageContainer className="space-y-5 pb-24">
        {cars.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Add a vehicle first"
            description="Documents are linked to a vehicle in your garage."
            action={
              <Button asChild className="h-11 rounded-2xl px-5">
                <Link href="/cars">Go to Cars</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="space-y-3 rounded-3xl border border-border/60 bg-card/80 p-4">
              <Input
                value={filters.query}
                onChange={(event) =>
                  updateFilters({ query: event.target.value })
                }
                placeholder="Search documents…"
                className="h-11 rounded-2xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filters.vehicleId}
                  onValueChange={(value) =>
                    updateFilters({
                      vehicleId: value as "all" | string,
                    })
                  }
                >
                  <SelectTrigger className="h-11 rounded-2xl">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vehicles</SelectItem>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {getCarDisplayName(car)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    updateFilters({
                      type: value as DocumentType | "all",
                    })
                  }
                >
                  <SelectTrigger className="h-11 rounded-2xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="all">All types</SelectItem>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    updateFilters({ sort: value as DocumentSort })
                  }
                >
                  <SelectTrigger className="col-span-2 h-11 rounded-2xl">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="expiry">Expiry date</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-3xl" />
                ))}
              </div>
            ) : null}

            {!isLoading && filtered.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Upload your first vehicle document."
                description="Insurance, ITP, registration, licenses — always available offline."
                action={
                  <Button
                    className="h-11 rounded-2xl px-5"
                    onClick={() => setSheetOpen(true)}
                  >
                    Upload Document
                  </Button>
                }
              />
            ) : null}

            {!isLoading && filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((document: VehicleDocument) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    vehicleName={carNameById.get(document.vehicleId)}
                    onOpen={() => undefined}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </PageContainer>

      {cars.length > 0 ? (
        <DocumentsFab onClick={() => setSheetOpen(true)} />
      ) : null}

      <DocumentFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cars={cars}
        defaultVehicleId={
          filters.vehicleId !== "all" ? filters.vehicleId : cars[0]?.id
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}
