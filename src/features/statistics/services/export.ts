import type { FuelEntry } from "@/types";
import type { MonthSeriesPoint } from "@/features/statistics/services/series";
import type { FuelStats } from "@/types";

export type StatsExportPayload = {
  exportedAt: string;
  filters: unknown;
  summary: FuelStats & { stops: number };
  monthly: MonthSeriesPoint[];
  entries: FuelEntry[];
};

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number | boolean | undefined | null) {
  const raw = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function exportStatisticsJson(payload: StatsExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(`car-companion-stats-${Date.now()}.json`, blob);
}

export function exportStatisticsCsv(entries: FuelEntry[]) {
  const headers = [
    "id",
    "carId",
    "date",
    "odometer",
    "liters",
    "pricePerLiter",
    "totalCost",
    "fuelStation",
    "fuelType",
    "isFullTank",
    "consumption",
    "notes",
  ];

  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.carId,
      entry.date,
      entry.odometer,
      entry.liters,
      entry.pricePerLiter,
      entry.totalCost,
      entry.fuelStation ?? "",
      entry.fuelType,
      entry.isFullTank,
      entry.consumption ?? "",
      entry.notes ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(`car-companion-fuel-${Date.now()}.csv`, blob);
}

/** PDF export placeholder — generation not implemented yet */
export function exportStatisticsPdfPlaceholder(): {
  ok: false;
  message: string;
} {
  return {
    ok: false,
    message: "PDF export is coming soon.",
  };
}
