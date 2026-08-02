"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BOTTOM_NAV_ITEMS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 px-3 pb-2 md:hidden"
    >
      <div className="glass-card mx-auto flex h-[var(--nav-height)] max-w-lg items-stretch rounded-[1.75rem] px-1.5 shadow-[var(--shadow-glass)]">
        <ul className="flex w-full items-stretch justify-around">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href} className="flex flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors duration-200",
                    "touch-target",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive ? (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-pill"}
                      aria-hidden
                      className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-2xl bg-primary/12"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  ) : null}
                  <motion.span
                    animate={
                      reduce
                        ? undefined
                        : { scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }
                    }
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  >
                    <Icon
                      className="size-5"
                      strokeWidth={isActive ? 2.35 : 1.75}
                      aria-hidden
                    />
                  </motion.span>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      isActive && "font-semibold",
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
