"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { DeleteServiceDialog } from "@/features/service/components/delete-service-dialog";
import { ServiceDetailSkeleton } from "@/features/service/components/service-skeletons";
import { ServiceDetailView } from "@/features/service/components/service-detail-view";
import { ServiceFormSheet } from "@/features/service/components/service-form-sheet";
import { useServiceRecord } from "@/features/service/hooks/use-service-record";
import {
  createServiceRecord,
  deleteServiceRecord,
  updateServiceRecord,
} from "@/features/service/repository";
import {
  duplicateServiceInput,
  formValuesToServiceInput,
} from "@/features/service/utils";
import { getCars } from "@/features/cars/repository";
import type { ServiceFormValues } from "@/lib/validations/service";
import type { Car } from "@/types";

type ServiceDetailPageClientProps = {
  recordId: string;
};

export function ServiceDetailPageClient({
  recordId,
}: ServiceDetailPageClientProps) {
  const router = useRouter();
  const { record, car, kmDrivenSince, history, isLoading, notFound, refresh } =
    useServiceRecord(recordId);
  const [cars, setCars] = useState<Car[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getCars().then(setCars);
  }, []);

  const handleSubmit = async (values: ServiceFormValues) => {
    if (!record) return;
    await updateServiceRecord(record.id, formValuesToServiceInput(values));
    toast.success("Service entry updated");
    await refresh();
  };

  const handleDuplicate = async () => {
    if (!record) return;
    setBusy(true);
    try {
      const copy = await createServiceRecord(duplicateServiceInput(record));
      toast.success("Service record duplicated");
      router.push(`/service/${copy.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    setBusy(true);
    try {
      await deleteServiceRecord(record.id);
      toast.success("Service record deleted");
      router.replace("/service");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Service"
        subtitle={record?.title}
        leading={
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl"
            aria-label="Back to service"
          >
            <Link href="/service">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
      />

      <PageContainer className="space-y-6 pb-10">
        {isLoading ? <ServiceDetailSkeleton /> : null}

        {!isLoading && notFound ? (
          <EmptyState
            icon={Compass}
            title="Record not found"
            description="This service entry isn’t on this device anymore."
            action={
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/service">Back to service</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && record ? (
          <>
            <ServiceDetailView
              record={record}
              car={car}
              kmDrivenSince={kmDrivenSince}
              history={history}
            />

            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-tight">Actions</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  className="h-12 justify-start gap-3 rounded-xl"
                  variant="secondary"
                  onClick={() => setSheetOpen(true)}
                  disabled={busy}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  className="h-12 justify-start gap-3 rounded-xl"
                  variant="secondary"
                  onClick={handleDuplicate}
                  disabled={busy}
                >
                  <Copy className="size-4" />
                  Duplicate
                </Button>
                <Button
                  className="h-12 justify-start gap-3 rounded-xl text-destructive hover:text-destructive sm:col-span-2"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  disabled={busy}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </section>
          </>
        ) : null}
      </PageContainer>

      <ServiceFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cars={cars}
        record={record}
        onSubmit={handleSubmit}
      />

      <DeleteServiceDialog
        record={record}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          setDeleteOpen(false);
          void handleDelete();
        }}
      />
    </>
  );
}
