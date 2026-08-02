"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  APP_NAME,
  BOTTOM_NAV_ITEMS,
  MORE_MENU_ITEMS,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  ...BOTTOM_NAV_ITEMS.filter((item) => item.href !== "/more"),
  ...MORE_MENU_ITEMS,
];

export function SideNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/50 bg-sidebar backdrop-blur-2xl md:flex md:flex-col">
      <div className="safe-top flex h-[var(--header-height)] items-center gap-2.5 border-b border-border/50 px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary shadow-inner">
          CC
        </span>
        <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <nav aria-label="Sidebar" className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive ? (
                    <motion.span
                      layoutId={reduce ? undefined : "sidebar-pill"}
                      className="absolute inset-0 -z-10 rounded-2xl bg-primary/12"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  ) : null}
                  <Icon
                    className="size-4"
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
