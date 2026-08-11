"use client";

import { useCaptureLauncher } from "@/components/desktop/CaptureLauncherContext";
import {
  IconGrid,
  IconMic,
  IconSearch,
  IconUser,
} from "@/components/icons/ListenerIcons";
import { trackNavViewed, type NavDest } from "@/lib/analytics/events";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/projects",
    dest: "projects" as const satisfies NavDest,
    label: "Projects",
    match: (p: string) =>
      p === "/" ||
      p === "/d" ||
      p.startsWith("/projects") ||
      p.startsWith("/ideas") ||
      p.startsWith("/d/projects") ||
      p.startsWith("/d/ideas") ||
      (p.startsWith("/d") &&
        !p.startsWith("/d/search") &&
        !p.startsWith("/d/account")),
    Icon: IconGrid,
  },
  {
    href: "/search",
    dest: "search" as const satisfies NavDest,
    label: "Search",
    match: (p: string) => p.startsWith("/search") || p.startsWith("/d/search"),
    Icon: IconSearch,
  },
  {
    href: "/account",
    dest: "account" as const satisfies NavDest,
    label: "Account",
    match: (p: string) =>
      p.startsWith("/account") || p.startsWith("/d/account"),
    Icon: IconUser,
  },
] as const;

const DesktopRail = () => {
  const pathname = usePathname();
  const { openCapture } = useCaptureLauncher();

  return (
    <aside
      aria-label="Main"
      className="flex h-full w-20 shrink-0 flex-col items-center border-r border-border bg-surface pt-[22px] pb-5"
    >
      <div className="font-serif text-[15px] leading-none tracking-[0.01em] text-text">
        Listener
      </div>

      <button
        type="button"
        onClick={() => openCapture()}
        className="mt-[26px] flex flex-col items-center gap-2 text-[9px] font-medium tracking-[0.12em] text-gold-deep uppercase transition hover:brightness-110"
      >
        <span className="grid h-[46px] w-[46px] place-items-center rounded-full bg-gold text-white shadow-[0_0_0_6px_var(--gold-10)]">
          <IconMic size={18} className="text-white" />
        </span>
        Record
      </button>

      <div className="my-6 h-px w-7 bg-border" />

      <ul className="flex flex-col items-center gap-1.5">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => trackNavViewed(item.dest, "desktop")}
                className={`flex w-[62px] flex-col items-center gap-[7px] rounded-xl px-1 py-2.5 text-[9px] font-medium tracking-[0.1em] uppercase transition ${
                  active
                    ? "bg-gold-10 text-gold-deep"
                    : "text-muted hover:text-text-secondary"
                }`}
              >
                <item.Icon size={18} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default DesktopRail;
