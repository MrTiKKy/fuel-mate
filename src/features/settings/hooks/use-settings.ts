"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import type {
  AppSettings,
  Car,
  DatabaseStats,
  ImportSummary,
} from "@/types";
import * as carsRepo from "@/features/cars/repository";
import {
  formatBytes,
  getAppSettings,
  getDatabaseStats,
  updateAppSettings,
} from "@/features/settings/repository";
import {
  deleteAllFuelEntries,
  deleteAllServiceRecords,
  exportBackupJson,
  importBackup,
  readBackupFile,
  resetDatabase,
  summarizeBackup,
} from "@/features/settings/services/backup";
import type { ValidatedBackup } from "@/features/settings/services/validation";
import { DEFAULT_SETTINGS } from "@/lib/db";

export function useSettings() {
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [cars, setCars] = useState<Car[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    backup: ValidatedBackup;
    summary: ImportSummary;
    fileName: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextSettings, nextCars, nextStats] = await Promise.all([
        getAppSettings(),
        carsRepo.getCars(),
        getDatabaseStats(),
      ]);
      setSettings(nextSettings);
      setCars(nextCars);
      setStats(nextStats);
      setTheme(nextSettings.theme);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load settings",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patchSettings = useCallback(
    async (partial: Partial<AppSettings>, options?: { toast?: boolean }) => {
      setIsSaving(true);
      try {
        const next = await updateAppSettings(partial);
        setSettings(next);
        if (partial.theme) {
          setTheme(partial.theme);
        }
        setStats(await getDatabaseStats());
        if (options?.toast) {
          toast.success("Settings saved");
        }
        return next;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save settings",
        );
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [setTheme],
  );

  const setDefaultVehicle = useCallback(
    async (carId: string | undefined) => {
      if (carId) {
        await carsRepo.setActiveCar(carId);
        const next = await getAppSettings();
        setSettings(next);
        toast.success("Default vehicle updated");
        return;
      }
      await patchSettings({ activeCarId: undefined });
    },
    [patchSettings],
  );

  const patchNotifications = useCallback(
    async (key: keyof AppSettings["notifications"], value: boolean) => {
      const notifications = {
        ...settings.notifications,
        [key]: value,
      };
      await patchSettings({ notifications });
    },
    [patchSettings, settings.notifications],
  );

  const handleExport = useCallback(async () => {
    try {
      await exportBackupJson();
      setStats(await getDatabaseStats());
      toast.success("Backup exported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    }
  }, []);

  const handlePickImportFile = useCallback(async (file: File) => {
    try {
      const backup = await readBackupFile(file);
      setPendingImport({
        backup,
        summary: summarizeBackup(backup),
        fileName: file.name,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid backup");
    }
  }, []);

  const confirmImport = useCallback(async () => {
    if (!pendingImport) return;
    try {
      const summary = await importBackup(pendingImport.backup);
      setPendingImport(null);
      await refresh();
      toast.success(
        `Imported ${summary.cars} cars, ${summary.fuelEntries} fuel, ${summary.serviceRecords} services`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  }, [pendingImport, refresh]);

  const handleResetAll = useCallback(async () => {
    await resetDatabase();
    await refresh();
    toast.success("All data reset");
  }, [refresh]);

  const handleDeleteFuel = useCallback(async () => {
    const count = await deleteAllFuelEntries();
    setStats(await getDatabaseStats());
    toast.success(`Deleted ${count} fuel entries`);
  }, []);

  const handleDeleteService = useCallback(async () => {
    const count = await deleteAllServiceRecords();
    setStats(await getDatabaseStats());
    toast.success(`Deleted ${count} service records`);
  }, []);

  return {
    settings,
    cars,
    stats,
    isLoading,
    isSaving,
    pendingImport,
    setPendingImport,
    refresh,
    patchSettings,
    setDefaultVehicle,
    patchNotifications,
    handleExport,
    handlePickImportFile,
    confirmImport,
    handleResetAll,
    handleDeleteFuel,
    handleDeleteService,
    formatBytes,
  };
}
