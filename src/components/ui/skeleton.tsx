import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted/70",
        "after:absolute after:inset-0 after:skeleton-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
