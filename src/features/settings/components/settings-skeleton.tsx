import { Skeleton } from "@/components/ui/skeleton";

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
