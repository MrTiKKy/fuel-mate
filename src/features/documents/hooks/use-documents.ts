"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Car, CreateDocumentInput, VehicleDocument } from "@/types";
import * as carsRepo from "@/features/cars/repository";
import * as docsRepo from "@/features/documents/repository";
import {
  DEFAULT_DOCUMENT_FILTERS,
  filterAndSortDocuments,
  type DocumentFilters,
} from "@/features/documents/selectors";

export function useDocuments() {
  const [cars, setCars] = useState<Car[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [filters, setFilters] = useState<DocumentFilters>(
    DEFAULT_DOCUMENT_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextCars, nextDocs] = await Promise.all([
        carsRepo.getCars(),
        docsRepo.getDocuments(),
      ]);
      setCars(nextCars);
      setDocuments(nextDocs);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load documents",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(
    () => filterAndSortDocuments(documents, filters),
    [documents, filters],
  );

  const reminders = useMemo(
    () => docsRepo.getDocumentReminders(documents),
    [documents],
  );

  const updateFilters = useCallback((partial: Partial<DocumentFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const createDocument = useCallback(
    async (input: CreateDocumentInput, files: File[]) => {
      const doc = await docsRepo.createDocument(input, files);
      await refresh();
      toast.success("Document saved");
      return doc;
    },
    [refresh],
  );

  const updateDocument = useCallback(
    async (
      id: string,
      input: Parameters<typeof docsRepo.updateDocument>[1],
      files: File[] = [],
    ) => {
      const doc = await docsRepo.updateDocument(id, input, files);
      await refresh();
      toast.success("Document updated");
      return doc;
    },
    [refresh],
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      await docsRepo.deleteDocument(id);
      await refresh();
      toast.success("Document deleted");
    },
    [refresh],
  );

  const run = useCallback((action: () => Promise<unknown>) => {
    startTransition(() => {
      void action().catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      });
    });
  }, []);

  return {
    cars,
    documents,
    filtered,
    filters,
    updateFilters,
    reminders,
    isLoading,
    isPending,
    refresh,
    createDocument,
    updateDocument,
    deleteDocument,
    run,
  };
}
