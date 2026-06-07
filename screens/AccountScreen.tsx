"use client";

import Avatar from "@/components/ui/Avatar";
import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import DeleteAccountSheet from "@/components/confirm/DeleteAccountSheet";
import useAccountStats from "@/hooks/useAccountStats";
import { useProfile } from "@/hooks/useProfile";
import { deleteAccount } from "@/lib/account/delete";
import { appShellClass } from "@/lib/layout/shell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AccountScreen = () => {
  const profile = useProfile();
  const { stats, error: statsError } = useAccountStats();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      router.push("/login");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className={`${appShellClass} min-h-[calc(100dvh-4.5rem)]`}>
      <AppShellHeader title="Account" />

      <ScrollBody>
        <div className="flex flex-col items-center py-4">
          <Avatar
            size={80}
            photoUrl={profile?.avatarUrl}
            initial={profile?.displayName ?? "?"}
          />
          <h2 className="mt-4 font-serif text-2xl text-text">
            {profile?.displayName ?? "…"}
          </h2>
          <p className="text-sm text-muted">{profile?.email ?? ""}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <Link
            href="/account/settings"
            className="flex items-center justify-between px-4 py-3.5 text-sm text-text transition hover:bg-black/[0.02]"
          >
            Settings
            <span className="text-muted">→</span>
          </Link>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-text">Recordings</span>
            <span className="text-sm text-muted">
              {stats?.recordings ?? "—"}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-text">Projects</span>
            <span className="text-sm text-muted">{stats?.projects ?? "—"}</span>
          </div>
        </div>
        {statsError ? (
          <p className="mt-2 text-center text-xs text-red">{statsError}</p>
        ) : null}

        <form action="/auth/logout" method="post" className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-medium text-red transition hover:border-red/30"
          >
            Sign out
          </button>
        </form>

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="mt-3 w-full py-2 text-center text-sm text-muted transition hover:text-red"
        >
          Delete account
        </button>
      </ScrollBody>

      {profile?.email ? (
        <DeleteAccountSheet
          open={deleteOpen}
          email={profile.email}
          busy={deleting}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      ) : null}
    </main>
  );
};

export default AccountScreen;
