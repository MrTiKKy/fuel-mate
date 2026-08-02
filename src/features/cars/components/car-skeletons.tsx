import { Skeleton } from "@/components/ui/skeleton";

export function CarListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading vehicles">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-4 w-24 rounded-lg" />
            </div>
            <Skeleton className="size-10 rounded-xl" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CarDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading vehicle">
      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-lg" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-20 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
