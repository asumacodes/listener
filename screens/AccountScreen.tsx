"use client";

import Wordmark from "@/components/Wordmark";
import useAccountStats from "@/hooks/useAccountStats";
import { useProfile } from "@/hooks/useProfile";

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

const AccountScreen = () => {
  const profile = useProfile();
  const { stats, error: statsError } = useAccountStats();

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 pt-4">
      <Wordmark />

      <div className="mt-8 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gold/15 font-serif text-3xl text-gold">
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
        </div>
        <h2 className="mt-4 font-serif text-2xl text-text">
          {profile?.displayName ?? "…"}
        </h2>
        <p className="text-sm text-muted">{profile?.email ?? ""}</p>

        <button
          type="button"
          disabled
          className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted"
          title="Profile editing coming soon"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit profile
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-text">Recordings</span>
          <span className="text-sm text-muted">{stats?.recordings ?? "—"}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-text">Projects</span>
          <span className="text-sm text-muted">{stats?.projects ?? "—"}</span>
        </div>
      </div>
      {statsError && (
        <p className="mt-2 text-center text-xs text-red">{statsError}</p>
      )}

      <form action="/auth/logout" method="post" className="mt-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-medium text-red transition hover:border-red/30"
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
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </form>
    </main>
  );
};

export default AccountScreen;
