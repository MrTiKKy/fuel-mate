"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { Section } from "@/components/shared/section";
import { StatCard } from "@/components/shared/stat-card";
import { DeleteFuelDialog } from "@/features/fuel/components/delete-fuel-dialog";
import { FuelFab } from "@/features/fuel/components/fuel-fab";
import { FuelFormSheet } from "@/features/fuel/components/fuel-form-sheet";
import { FuelList } from "@/features/fuel/components/fuel-list";
import type { FuelAction } from "@/features/fuel/components/fuel-actions-menu";
import { useFuelEntries } from "@/features/fuel/hooks/use-fuel-entries";
import { formValuesToFuelInput } from "@/features/fuel/utils";
import { getCarDisplayName } from "@/features/cars/utils";
import { formatCurrency, formatDistance, formatNumber } from "@/lib/formatters";
import type { FuelEntryFormValues } from "@/lib/validations/fuel";
import type { FuelEntry } from "@/types";
import { Droplets, Fuel, Gauge, Route } from "lucide-react";

export function FuelPageClient() {
  const {
    entries,
    cars,
    selectedCarId,
    stats,
    isLoading,
    isPending,
    selectCar,
    createEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    run,
  } = useFuelEntries();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FuelEntry | null>(null);
  const [deleting, setDeleting] = useState<FuelEntry | null>(null);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const handleAction = (entry: FuelEntry, action: FuelAction) => {
    switch (action) {
      case "edit":
        setEditing(entry);
        setSheetOpen(true);
        break;
      case "delete":
        setDeleting(entry);
        break;
      case "duplicate":
        run(() => duplicateEntry(entry));
        break;
    }
  };

  const handleSubmit = async (values: FuelEntryFormValues) => {
    const input = formValuesToFuelInput(values);
    if (editing) {
      await updateEntry(editing.id, input);
    } else {
      await createEntry(input);
    }
  };

  return (
    <>
      <AppHeader
        title="Fuel Log"
        subtitle={
          isLoading
            ? "Loading…"
            : selectedCarId
              ? `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`
              : "Track fill-ups"
        }
      />

      <PageContainer className="space-y-5">
        {cars.length > 0 ? (
          <div className="space-y-3">
            <Select
              value={selectedCarId}
              onValueChange={(value) => void selectCar(value)}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-border/70 bg-card px-4 text-base">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {getCarDisplayName(car)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isLoading && entries.length > 0 ? (
              <Section title="This vehicle">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <StatCard
                    label="Fuel cost"
                    value={formatCurrency(stats.totalFuelCost)}
                    icon={Droplets}
                  />
                  <StatCard
                    label="Liters"
                    value={`${formatNumber(stats.totalLiters, "en-US", 1)} L`}
                    icon={Fuel}
                  />
                  <StatCard
                    label="Avg. consumption"
                    value={
                      stats.averageConsumption > 0
                        ? `${stats.averageConsumption.toFixed(2)} L/100km`
                        : "—"
                    }
                    icon={Gauge}
                  />
                  <StatCard
                    label="Distance"
                    value={formatDistance(stats.distanceTravelled)}
                    icon={Route}
                    className="md:col-span-1"
                  />
                  <StatCard
                    label="Cost / km"
                    value={
                      stats.costPerKm > 0
                        ? formatCurrency(stats.costPerKm)
                        : "—"
                    }
                  />
                  <StatCard
                    label="Cost / 100 km"
                    value={
                      stats.costPer100Km > 0
                        ? formatCurrency(stats.costPer100Km)
                        : "—"
                    }
                  />
                </div>
              </Section>
            ) : null}
          </div>
        ) : null}

        <FuelList
          entries={entries}
          cars={cars}
          isLoading={isLoading}
          onAdd={openCreate}
          onAction={handleAction}
        />
      </PageContainer>

      {cars.length > 0 ? <FuelFab onClick={openCreate} /> : null}

      <FuelFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cars={cars}
        entry={editing}
        defaultCarId={selectedCarId}
        onSubmit={handleSubmit}
      />

      <DeleteFuelDialog
        entry={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => {
          if (!deleting) return;
          const id = deleting.id;
          const carId = deleting.carId;
          setDeleting(null);
          run(() => deleteEntry(id, carId));
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
