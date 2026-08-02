import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function AppHeader({
  title,
  subtitle,
  leading,
  action,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "safe-top sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-2xl",
        className,
      )}
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-5xl items-center gap-3 px-4 md:px-6">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
