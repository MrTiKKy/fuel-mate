"use client";

import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  exportStatisticsCsv,
  exportStatisticsJson,
  exportStatisticsPdfPlaceholder,
} from "@/features/statistics/services/export";
import type { StatisticsSnapshot } from "@/features/statistics/selectors";
import type { FuelEntry } from "@/types";

type StatsExportBarProps = {
  snapshot: StatisticsSnapshot;
  entries: FuelEntry[];
};

export function StatsExportBar({ snapshot, entries }: StatsExportBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Download className="size-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-tight">Export</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant="secondary"
          className="h-11 justify-start gap-2 rounded-xl"
          onClick={() => {
            exportStatisticsCsv(entries);
            toast.success("CSV exported");
          }}
          disabled={entries.length === 0}
        >
          <FileSpreadsheet className="size-4" />
          CSV
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 justify-start gap-2 rounded-xl"
          onClick={() => {
            exportStatisticsJson({
              exportedAt: new Date().toISOString(),
              filters: snapshot.filters,
              summary: snapshot.summary,
              monthly: snapshot.monthly,
              entries,
            });
            toast.success("JSON exported");
          }}
          disabled={entries.length === 0}
        >
          <FileJson className="size-4" />
          JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 justify-start gap-2 rounded-xl"
          onClick={() => {
            const result = exportStatisticsPdfPlaceholder();
            toast.message(result.message);
          }}
        >
          <FileText className="size-4" />
          PDF
        </Button>
      </div>
    </div>
  );
}
