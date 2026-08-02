"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export function OfflinePageClient() {
  return (
    <>
      <AppHeader title="Offline" subtitle="You're not connected" />
      <PageContainer>
        <EmptyState
          icon={WifiOff}
          title="No connection"
          description="Car Companion works offline. Cached pages are still available — reconnect when you can."
          suggestion="Try Home or any page you already opened — your local data is still here."
          action={
            <Button asChild className="h-11 rounded-xl px-5">
              <Link href="/">Back home</Link>
            </Button>
          }
        />
      </PageContainer>
    </>
  );
}
