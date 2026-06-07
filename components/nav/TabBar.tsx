"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconGrid,
  IconMic,
  IconSearch,
  IconUser,
} from "@/components/icons/ListenerIcons";

const iconCls = "h-6 w-6";

const TABS = [
  {
    href: "/",
    label: "Record",
    match: (p: string) => p === "/",
    Icon: IconMic,
  },
  {
    href: "/projects",
    label: "Projects",
    match: (p: string) => p.startsWith("/projects"),
    Icon: IconGrid,
  },
  {
    href: "/search",
    label: "Search",
    match: (p: string) => p.startsWith("/search"),
    Icon: IconSearch,
  },
  {
    href: "/account",
    label: "Account",
    match: (p: string) => p.startsWith("/account"),
    Icon: IconUser,
  },
] as const;

const TabBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
    >
      <ul className="flex w-full items-stretch justify-around">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium tracking-wide transition ${
                  active ? "text-gold" : "text-muted"
                }`}
              >
                <tab.Icon className={iconCls} size={24} />
                {tab.label}
                {active ? (
                  <span
                    className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-gold"
                    aria-hidden
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TabBar;
