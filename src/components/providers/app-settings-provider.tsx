"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/db";
import type { AppSettings, CurrencyCode } from "@/types";

type AppSettingsContextValue = {
  settings: AppSettings;
  currency: CurrencyCode;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  setSettingsLocal: (next: AppSettings) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const next = await getSettings();
      setSettings(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const onUpdated = () => {
      void refreshSettings();
    };
    window.addEventListener("garage-plus:settings-updated", onUpdated);
    return () => {
      window.removeEventListener("garage-plus:settings-updated", onUpdated);
    };
  }, [refreshSettings]);

  const value = useMemo(
    () => ({
      settings,
      currency: settings.currency,
      isLoading,
      refreshSettings,
      setSettingsLocal: setSettings,
    }),
    [settings, isLoading, refreshSettings],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettingsContext() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error("useAppSettingsContext must be used within AppSettingsProvider");
  }
  return ctx;
}

export function useCurrency(): CurrencyCode {
  const ctx = useContext(AppSettingsContext);
  return ctx?.currency ?? DEFAULT_SETTINGS.currency;
}

/** Notify the app that settings changed so all screens refresh currency etc. */
export function notifySettingsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("garage-plus:settings-updated"));
  }
}
