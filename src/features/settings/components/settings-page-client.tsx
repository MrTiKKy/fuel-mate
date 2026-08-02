"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileJson,
  Info,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FUEL_TYPE_OPTIONS } from "@/features/cars/constants";
import { ConfirmDialog } from "@/features/settings/components/confirm-dialog";
import { ImportSummaryDialog } from "@/features/settings/components/import-summary-dialog";
import {
  SettingsDivider,
  SettingsRow,
} from "@/features/settings/components/settings-row";
import { SettingsSection } from "@/features/settings/components/settings-section";
import { SettingsSelect } from "@/features/settings/components/settings-select";
import { SettingsPageSkeleton } from "@/features/settings/components/settings-skeleton";
import {
  ACCENT_OPTIONS,
  APP_DEVELOPER,
  APP_NAME,
  APP_VERSION,
  BUILD_VERSION,
  CONSUMPTION_OPTIONS,
  CURRENCY_OPTIONS,
  DISTANCE_OPTIONS,
  GITHUB_URL,
  NOTIFICATION_OPTIONS,
  THEME_OPTIONS,
  VOLUME_OPTIONS,
  WEBSITE_URL,
} from "@/features/settings/constants";
import { useSettings } from "@/features/settings/hooks/use-settings";
import { parseLocaleNumber } from "@/lib/numbers";
import type {
  AccentColor,
  ConsumptionUnit,
  CurrencyCode,
  DistanceUnit,
  FuelType,
  VolumeUnit,
} from "@/types";

type ThemeMode = "dark" | "light" | "system";

type DangerAction = "reset" | "fuel" | "service" | null;

const NONE_VEHICLE = "__none__";

export function SettingsPageClient() {
  const {
    settings,
    cars,
    stats,
    isLoading,
    isSaving,
    pendingImport,
    setPendingImport,
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
  } = useSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dangerAction, setDangerAction] = useState<DangerAction>(null);
  const [tankDraft, setTankDraft] = useState<string | null>(null);

  const tankValue =
    tankDraft ??
    (settings.defaultTankCapacity != null
      ? String(settings.defaultTankCapacity)
      : "");

  const vehicleOptions = [
    { value: NONE_VEHICLE, label: "None" },
    ...cars.map((car) => ({
      value: car.id,
      label: car.name || `${car.brand} ${car.model}`,
    })),
  ];

  const accentOptions = ACCENT_OPTIONS.map((option) => ({
    value: option.value,
    label:
      option.value === "teal"
        ? option.label
        : `${option.label} · Coming soon`,
    disabled: option.value !== "teal",
  }));

  const dbStatusLabel =
    stats?.status === "ok"
      ? "Healthy"
      : stats?.status === "empty"
        ? "Empty"
        : "Error";

  const lastBackupLabel = stats?.lastBackupAt
    ? format(new Date(stats.lastBackupAt), "dd MMM yyyy · HH:mm")
    : "Never";

  const commitTankCapacity = async () => {
    const trimmed = tankValue.trim();
    if (!trimmed) {
      setTankDraft(null);
      await patchSettings({ defaultTankCapacity: undefined });
      return;
    }
    const parsed = parseLocaleNumber(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setTankDraft(
        settings.defaultTankCapacity != null
          ? String(settings.defaultTankCapacity)
          : "",
      );
      return;
    }
    setTankDraft(null);
    await patchSettings({ defaultTankCapacity: parsed });
  };

  return (
    <>
      <AppHeader title="Settings" subtitle="Preferences & data" />
      <PageContainer className="space-y-7 pb-10">
        {isLoading ? <SettingsPageSkeleton /> : null}

        {!isLoading ? (
          <div className="space-y-7 animate-[fade-in_0.35s_ease-out]">
            <SettingsSection
              title="Profile"
              description="App identity and local storage"
            >
              <SettingsRow label="App version">
                <Badge variant="secondary" className="rounded-lg">
                  v{APP_VERSION}
                </Badge>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Build version">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {BUILD_VERSION}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Storage used">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {stats ? formatBytes(stats.estimatedSizeBytes) : "—"}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Database status">
                <Badge
                  variant={stats?.status === "error" ? "destructive" : "secondary"}
                  className="rounded-lg"
                >
                  {dbStatusLabel}
                </Badge>
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              title="Vehicle settings"
              description="Defaults for new entries"
            >
              <SettingsRow label="Default vehicle">
                <SettingsSelect
                  value={settings.activeCarId ?? NONE_VEHICLE}
                  onValueChange={(value) => {
                    void setDefaultVehicle(
                      value === NONE_VEHICLE ? undefined : value,
                    );
                  }}
                  options={vehicleOptions}
                  disabled={isSaving}
                  className="h-10 w-[11rem] rounded-xl"
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Preferred fuel type">
                <SettingsSelect
                  value={settings.preferredFuelType ?? "petrol"}
                  onValueChange={(value) => {
                    void patchSettings({
                      preferredFuelType: value as FuelType,
                    });
                  }}
                  options={FUEL_TYPE_OPTIONS}
                  disabled={isSaving}
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow
                label="Default tank capacity"
                description="Liters or gallons per your volume unit"
              >
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="—"
                  value={tankValue}
                  onChange={(event) => setTankDraft(event.target.value)}
                  onBlur={() => {
                    void commitTankCapacity();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                  className="h-10 w-24 rounded-xl text-right tabular-nums"
                  disabled={isSaving}
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Default currency">
                <SettingsSelect
                  value={settings.currency}
                  onValueChange={(value) => {
                    void patchSettings({ currency: value as CurrencyCode });
                  }}
                  options={[...CURRENCY_OPTIONS]}
                  disabled={isSaving}
                />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection title="Units" description="Display preferences">
              <SettingsRow label="Distance">
                <SettingsSelect
                  value={settings.distanceUnit}
                  onValueChange={(value) => {
                    void patchSettings({
                      distanceUnit: value as DistanceUnit,
                    });
                  }}
                  options={[...DISTANCE_OPTIONS]}
                  disabled={isSaving}
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Fuel consumption">
                <SettingsSelect
                  value={settings.consumptionUnit}
                  onValueChange={(value) => {
                    void patchSettings({
                      consumptionUnit: value as ConsumptionUnit,
                    });
                  }}
                  options={[...CONSUMPTION_OPTIONS]}
                  disabled={isSaving}
                  className="h-10 w-[10.5rem] rounded-xl"
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Volume">
                <SettingsSelect
                  value={settings.volumeUnit}
                  onValueChange={(value) => {
                    void patchSettings({ volumeUnit: value as VolumeUnit });
                  }}
                  options={[...VOLUME_OPTIONS]}
                  disabled={isSaving}
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Currency">
                <SettingsSelect
                  value={settings.currency}
                  onValueChange={(value) => {
                    void patchSettings({ currency: value as CurrencyCode });
                  }}
                  options={[...CURRENCY_OPTIONS]}
                  disabled={isSaving}
                />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              title="Appearance"
              description="Theme and accent (accent colors coming soon)"
            >
              <SettingsRow label="Theme">
                <SettingsSelect
                  value={settings.theme}
                  onValueChange={(value) => {
                    void patchSettings({ theme: value as ThemeMode });
                  }}
                  options={[...THEME_OPTIONS]}
                  disabled={isSaving}
                />
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow
                label="Accent color"
                description="Architecture ready · custom colors not applied yet"
              >
                <SettingsSelect
                  value={settings.accentColor}
                  onValueChange={(value) => {
                    void patchSettings({ accentColor: value as AccentColor });
                  }}
                  options={accentOptions}
                  disabled={isSaving}
                />
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              title="Notifications"
              description="Local reminder preferences · push not enabled"
            >
              {NOTIFICATION_OPTIONS.map((option, index) => (
                <div key={option.key}>
                  {index > 0 ? <SettingsDivider /> : null}
                  <SettingsRow
                    label={option.label}
                    description={option.description}
                  >
                    <Switch
                      checked={settings.notifications[option.key]}
                      onCheckedChange={(checked) => {
                        void patchNotifications(option.key, checked);
                      }}
                      disabled={isSaving}
                      className="h-6 w-11 data-[size=default]:h-6 data-[size=default]:w-11"
                      aria-label={option.label}
                    />
                  </SettingsRow>
                </div>
              ))}
            </SettingsSection>

            <SettingsSection
              id="backup"
              title="Backup"
              description="Export and restore your offline data"
            >
              <div className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">
                  Backups include cars, fuel entries, service records, and
                  settings in one JSON file.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="h-11 flex-1 rounded-xl"
                    onClick={() => {
                      void handleExport();
                    }}
                  >
                    <Download className="size-4" />
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    Import JSON
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDangerAction("reset")}
                >
                  <RotateCcw className="size-4" />
                  Reset database
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void handlePickImportFile(file);
                  }}
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Database"
              description="Local IndexedDB overview"
            >
              <SettingsRow label="Cars">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {stats?.cars ?? 0}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Fuel entries">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {stats?.fuelEntries ?? 0}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Service records">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {stats?.serviceRecords ?? 0}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Documents">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {stats?.documents ?? 0}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Saved calculations">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {stats?.savedCalculations ?? 0}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Database size">
                <span className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
                  <Database className="size-3.5 opacity-70" />
                  {stats ? formatBytes(stats.estimatedSizeBytes) : "—"}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Last backup">
                <span className="text-sm text-muted-foreground">
                  {lastBackupLabel}
                </span>
              </SettingsRow>
            </SettingsSection>

            <SettingsSection
              title="Danger zone"
              description="Irreversible actions · confirmation required"
            >
              <div className="space-y-2 p-4">
                <DangerButton
                  icon={<Trash2 className="size-4" />}
                  label="Reset all data"
                  description="Clear cars, fuel, services, and settings"
                  onClick={() => setDangerAction("reset")}
                />
                <DangerButton
                  icon={<FileJson className="size-4" />}
                  label="Delete all fuel entries"
                  description="Keep vehicles and service history"
                  onClick={() => setDangerAction("fuel")}
                />
                <DangerButton
                  icon={<AlertTriangle className="size-4" />}
                  label="Delete all service history"
                  description="Keep vehicles and fuel log"
                  onClick={() => setDangerAction("service")}
                />
              </div>
            </SettingsSection>

            <SettingsSection title="About">
              <SettingsRow label="Version">
                <span className="text-sm text-muted-foreground">
                  {APP_NAME} v{APP_VERSION}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <SettingsRow label="Developer">
                <span className="text-sm text-muted-foreground">
                  {APP_DEVELOPER}
                </span>
              </SettingsRow>
              <SettingsDivider />
              <AboutLink
                label="Privacy"
                description="Placeholder · coming soon"
              />
              <SettingsDivider />
              <AboutLink
                label="Licenses"
                description="Open-source notices"
              />
              <SettingsDivider />
              <AboutLink
                label="GitHub"
                description="Repository placeholder"
                href={GITHUB_URL}
                icon={<Code2 className="size-4" />}
              />
              <SettingsDivider />
              <AboutLink
                label="Website"
                description="Project site placeholder"
                href={WEBSITE_URL}
                icon={<ExternalLink className="size-4" />}
              />
              <SettingsDivider />
              <div className="flex items-start gap-3 px-4 py-3.5">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Offline-first PWA. All data stays on this device. No account,
                  no cloud sync.
                </p>
              </div>
            </SettingsSection>
          </div>
        ) : null}
      </PageContainer>

      {pendingImport ? (
        <ImportSummaryDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingImport(null);
          }}
          fileName={pendingImport.fileName}
          summary={pendingImport.summary}
          onConfirm={() => {
            void confirmImport();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={dangerAction === "reset"}
        onOpenChange={(open) => {
          if (!open) setDangerAction(null);
        }}
        title="Reset all data?"
        description="This permanently deletes every car, fuel entry, service record, and resets settings. This cannot be undone."
        confirmLabel="Reset everything"
        destructive
        onConfirm={() => {
          void handleResetAll();
          setDangerAction(null);
        }}
      />

      <ConfirmDialog
        open={dangerAction === "fuel"}
        onOpenChange={(open) => {
          if (!open) setDangerAction(null);
        }}
        title="Delete all fuel entries?"
        description="Every fuel log entry will be removed. Vehicles and service history stay intact."
        confirmLabel="Delete fuel entries"
        destructive
        onConfirm={() => {
          void handleDeleteFuel();
          setDangerAction(null);
        }}
      />

      <ConfirmDialog
        open={dangerAction === "service"}
        onOpenChange={(open) => {
          if (!open) setDangerAction(null);
        }}
        title="Delete all service history?"
        description="Every service record will be removed. Vehicles and fuel entries stay intact."
        confirmLabel="Delete service history"
        destructive
        onConfirm={() => {
          void handleDeleteService();
          setDangerAction(null);
        }}
      />
    </>
  );
}

function DangerButton({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-left transition-colors hover:bg-destructive/10 active:scale-[0.99]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-destructive">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function AboutLink({
  label,
  description,
  href,
  icon,
}: {
  label: string;
  description: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {icon ?? <ExternalLink className="size-4 text-muted-foreground" />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-14 items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3.5 opacity-70">
      {content}
    </div>
  );
}
