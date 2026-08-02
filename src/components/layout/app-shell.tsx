import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      <SideNav />
      <div className="relative flex min-h-dvh flex-1 flex-col">
        <main className="flex-1 pb-nav md:pb-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
