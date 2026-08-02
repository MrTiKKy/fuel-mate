"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <AppHeader title="Not found" subtitle="This page doesn't exist" />
      <PageContainer>
        <EmptyState
          icon={Compass}
          title="Lost the route"
          description="The page you're looking for isn't in the map. Head back home."
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
