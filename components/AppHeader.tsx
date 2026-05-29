"use client";

import { useOpenRecordingHistory } from "@/components/RecordingHistoryContext";
import { useProfile } from "@/hooks/useProfile";
import { formatTime } from "@/lib/format";
import { MAX_RECORDING_SECONDS } from "@/lib/media/recorder";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type AppHeaderProps = {
  isRecording?: boolean;
};

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

const AppHeader = ({ isRecording = false }: AppHeaderProps) => {
  const profile = useProfile();
  const openHistory = useOpenRecordingHistory();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="relative flex items-center justify-center py-3">
      {openHistory && (
        <button
          type="button"
          onClick={openHistory}
          aria-label="Search recordings"
          className="absolute left-0 text-muted transition hover:text-text"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}

      <h1 className="font-serif text-[28px] tracking-tight text-gold">
        Listener
      </h1>

      {isRecording && (
        <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs text-text">
          <span className="h-1.5 w-1.5 rounded-full bg-red" />
          {formatTime(MAX_RECORDING_SECONDS)} max
        </span>
      )}

      <div className="absolute right-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Account menu"
          aria-expanded={menuOpen}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gold/15 text-sm font-medium text-text"
        >
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initialOf(profile?.displayName ?? "?")
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="px-4 py-3">
              <p className="truncate text-sm font-medium text-text">
                {profile?.displayName ?? "…"}
              </p>
              <p className="truncate text-xs text-muted">
                {profile?.email ?? ""}
              </p>
            </div>
            <div className="h-px bg-border" />
            <Link
              href="/projects"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-background"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Projects
            </Link>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red hover:bg-background"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
