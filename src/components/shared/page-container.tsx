"use client";

import { MotionPage } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <MotionPage
      className={cn(
        "mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-8",
        className,
      )}
    >
      {children}
    </MotionPage>
  );
}
