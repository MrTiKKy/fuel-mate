"use client";

import {
  collectLocalMigratePayload,
  getDataMode,
} from "@/features/auth/local-migrate";
import { invalidateCloudCache } from "@/lib/cloud/client-snapshot";

let queue: Promise<void> = Promise.resolve();

/**
 * After a local write in cloud mode, push the IndexedDB dump to Neon (idempotent upsert).
 * Debounced via a serial queue so rapid writes don't race.
 */
export function maybePushLocalToCloud() {
  if (typeof window === "undefined") return;
  if (getDataMode() !== "cloud") return;

  queue = queue
    .then(async () => {
      const local = await collectLocalMigratePayload();
      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: "merge",
          cars: local.cars,
          fuelEntries: local.fuelEntries,
          serviceRecords: local.serviceRecords,
          documents: local.documents,
          documentFiles: local.documentFiles,
          savedCalculations: local.savedCalculations,
          settings: local.settings,
        }),
      });
      if (!res.ok) {
        console.error("Cloud push failed", await res.text());
        return;
      }
      invalidateCloudCache();
    })
    .catch((error) => {
      console.error("Cloud push error", error);
    });
}
