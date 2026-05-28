"use client";

import { FolderIcon, LogOutIcon } from "@/components/icons/HeaderIcons";
import useHeaderMenu from "@/hooks/useHeaderMenu";
import Link from "next/link";

const AppHeader = () => {
  const { email, initial, open, toggle, close, menuRef } = useHeaderMenu();

  return (
    <header className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center py-2">
      <div aria-hidden className="w-9" />

      <h1 className="text-center font-serif text-[28px] tracking-tight text-gold-brand">
        Listener
      </h1>

      <div ref={menuRef} className="relative justify-self-end">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-primary/50 bg-white/80 font-serif text-sm text-gold-brand outline-none transition hover:border-gold-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-cream)]"
        >
          {initial}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-[min(17rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-black/8 bg-card-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-fade-in"
          >
            <div className="border-b border-black/6 px-4 py-3">
              <p className="text-[10px] tracking-[0.12em] text-text-muted uppercase">
                Signed in as
              </p>
              <p className="mt-0.5 truncate text-sm text-text-primary">
                {email ?? "…"}
              </p>
            </div>

            <div className="py-1">
              <Link
                href="/projects"
                role="menuitem"
                onClick={close}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary transition hover:bg-black/[0.03] focus-visible:bg-black/[0.03] focus-visible:outline-none"
              >
                <FolderIcon className="text-text-muted" />
                Projects
              </Link>

              <form action="/auth/logout" method="post" role="none">
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-primary transition hover:bg-black/[0.03] focus-visible:bg-black/[0.03] focus-visible:outline-none"
                >
                  <LogOutIcon className="text-text-muted" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
