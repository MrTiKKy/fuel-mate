"use client";

import { useState } from "react";
import { Droplets, Wrench } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/features/dashboard/components/section-header";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { DeleteServiceDialog } from "@/features/service/components/delete-service-dialog";
import { ServiceFab } from "@/features/service/components/service-fab";
import { ServiceFiltersBar } from "@/features/service/components/service-filters-bar";
import { ServiceFormSheet } from "@/features/service/components/service-form-sheet";
import { ServiceList } from "@/features/service/components/service-list";
import type { ServiceAction } from "@/features/service/components/service-actions-menu";
import { useServiceRecords } from "@/features/service/hooks/use-service-records";
import {
  formValuesToServiceInput,
  getServiceTypeLabel,
} from "@/features/service/utils";
import { formatCurrency } from "@/lib/formatters";
import type { ServiceFormValues } from "@/lib/validations/service";
import type { ServiceRecord } from "@/types";

export function ServicePageClient() {
  const {
    cars,
    grouped,
    filters,
    updateFilters,
    odometerByCar,
    stats,
    isLoading,
    isPending,
    createRecord,
    updateRecord,
    deleteRecord,
    duplicateRecord,
    run,
  } = useServiceRecords();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const handleAction = (record: ServiceRecord, action: ServiceAction) => {
    switch (action) {
      case "edit":
        setEditing(record);
        setSheetOpen(true);
        break;
      case "delete":
        setDeleting(record);
        break;
      case "duplicate":
        run(() => duplicateRecord(record));
        break;
    }
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    const input = formValuesToServiceInput(values);
    if (editing) {
      await updateRecord(editing.id, input);
    } else {
      await createRecord(input);
    }
  };

  return (
    <>
      <AppHeader
        title="Service"
        subtitle={
          isLoading
            ? "Loading…"
            : `${stats.recordCount} record${stats.recordCount === 1 ? "" : "s"}`
        }
      />

      <PageContainer className="space-y-5">
        {cars.length > 0 ? (
          <>
            <ServiceFiltersBar
              cars={cars}
              filters={filters}
              onChange={updateFilters}
            />

            {!isLoading && stats.recordCount > 0 ? (
              <section className="space-y-3">
                <SectionHeader title="Maintenance costs" />
                <div className="grid grid-cols-2 gap-3">
                  <SummaryCard
                    label="Total"
                    value={formatCurrency(stats.totalMaintenanceCost)}
                    icon={Wrench}
                  />
                  <SummaryCard
                    label="This month"
                    value={formatCurrency(stats.costThisMonth)}
                    icon={Droplets}
                  />
                  <SummaryCard
                    label="This year"
                    value={formatCurrency(stats.costThisYear)}
                  />
                  <SummaryCard
                    label="Most common"
                    value={
                      stats.mostCommonService
                        ? getServiceTypeLabel(stats.mostCommonService)
                        : "—"
                    }
                    hint={
                      stats.mostCommonServiceCount > 0
                        ? `${stats.mostCommonServiceCount}×`
                        : undefined
                    }
                  />
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        <ServiceList
          cars={cars}
          grouped={grouped}
          odometerByCar={odometerByCar}
          isLoading={isLoading}
          onAdd={openCreate}
          onAction={handleAction}
        />
      </PageContainer>

      {cars.length > 0 ? <ServiceFab onClick={openCreate} /> : null}

      <ServiceFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cars={cars}
        record={editing}
        defaultCarId={
          filters.carId !== "all" ? filters.carId : cars[0]?.id
        }
        onSubmit={handleSubmit}
      />

      <DeleteServiceDialog
        record={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => {
          if (!deleting) return;
          const id = deleting.id;
          setDeleting(null);
          run(() => deleteRecord(id));
        }}
      />

      {isPending ? (
        <span className="sr-only" aria-live="polite">
          Updating…
        </span>
      ) : null}
    </>
  );
}
