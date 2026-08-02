import { Skeleton } from "@/components/ui/skeleton";

export function ServiceListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading service">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-36 rounded-2xl" />
      ))}
    </div>
  );
}

export function ServiceDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading record">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
