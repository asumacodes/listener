"use client";

import { useOpenRecordingHistory } from "@/components/RecordingHistoryContext";
import {
  FolderIcon,
  LogOutIcon,
  SearchIcon,
} from "@/components/icons/HeaderIcons";
import useHeaderMenu from "@/hooks/useHeaderMenu";
import { formatTime } from "@/lib/format";
import Link from "next/link";

type AppHeaderProps = {
  /** When set, shows the recording timer pill on the left instead of search. */
  recordingElapsedSeconds?: number;
};

const AppHeader = ({ recordingElapsedSeconds }: AppHeaderProps) => {
  const { email, initial, open, toggle, close, menuRef } = useHeaderMenu();
  const openHistory = useOpenRecordingHistory();
  const isRecording = recordingElapsedSeconds !== undefined;

  return (
    <header className="relative flex items-center justify-center py-2">
      {isRecording ? (
        <span
          className="absolute left-0 rounded-full bg-gold/10 px-2.5 py-1 font-mono text-xs tabular-nums text-text"
          aria-live="polite"
        >
          {formatTime(recordingElapsedSeconds)}
        </span>
      ) : (
        openHistory && (
          <button
            type="button"
            onClick={openHistory}
            aria-label="Search recordings"
            className="absolute left-0 text-muted transition hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        )
      )}

      <h1 className="font-serif text-[28px] tracking-tight text-gold">
        Listener
      </h1>

      <div ref={menuRef} className="absolute right-0">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-white/80 font-serif text-sm text-gold outline-none transition hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          {initial}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-[min(17rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-fade-in"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-[10px] tracking-[0.12em] text-muted uppercase">
                Signed in as
              </p>
              <p className="mt-0.5 truncate text-sm text-text">
                {email ?? "…"}
              </p>
            </div>

            <div className="py-1">
              <Link
                href="/projects"
                role="menuitem"
                onClick={close}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text transition hover:bg-black/[0.03] focus-visible:bg-black/[0.03] focus-visible:outline-none"
              >
                <FolderIcon className="text-muted" />
                Projects
              </Link>

              <form action="/auth/logout" method="post" role="none">
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text transition hover:bg-black/[0.03] focus-visible:bg-black/[0.03] focus-visible:outline-none"
                >
                  <LogOutIcon className="text-muted" />
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
