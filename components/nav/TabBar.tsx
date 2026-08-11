"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconGrid,
  IconMic,
  IconSearch,
  IconUser,
} from "@/components/icons/ListenerIcons";
import { trackNavViewed, type NavDest } from "@/lib/analytics/events";

const iconCls = "h-6 w-6";

const TABS = [
  {
    href: "/",
    label: "Record",
    match: (p: string) => p === "/",
    Icon: IconMic,
    dest: null,
  },
  {
    href: "/projects",
    label: "Projects",
    match: (p: string) => p.startsWith("/projects") || p.startsWith("/ideas"),
    Icon: IconGrid,
    dest: "projects" as const satisfies NavDest,
  },
  {
    href: "/search",
    label: "Search",
    match: (p: string) => p.startsWith("/search"),
    Icon: IconSearch,
    dest: "search" as const satisfies NavDest,
  },
  {
    href: "/account",
    label: "Account",
    match: (p: string) => p.startsWith("/account"),
    Icon: IconUser,
    dest: "account" as const satisfies NavDest,
  },
] as const;

const TabBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:inset-y-0 md:right-auto md:w-20 md:border-t-0 md:border-r md:pb-4 md:pt-6"
    >
      <ul className="flex w-full items-stretch justify-around md:flex-col md:justify-start md:gap-3">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href} className="flex-1 md:flex-none">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                onClick={
                  tab.dest
                    ? () => trackNavViewed(tab.dest, "mobile")
                    : undefined
                }
                className={`flex min-h-12 flex-col items-center justify-center gap-1 px-2 py-1 font-sans text-[11px] font-medium tracking-normal transition md:min-h-16 ${
                  active ? "text-gold" : "text-muted"
                }`}
              >
                <tab.Icon className={iconCls} size={24} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TabBar;
