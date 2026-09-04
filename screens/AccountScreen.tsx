"use client";

import AccountNavRow from "@/components/account/AccountNavRow";
import FeedbackSheet from "@/components/feedback/FeedbackSheet";
import Avatar from "@/components/ui/Avatar";
import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import useAccountStats from "@/hooks/useAccountStats";
import { useProfile } from "@/hooks/useProfile";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";
import Link from "next/link";
import { useState } from "react";

const AccountScreen = () => {
  const profile = useProfile();
  const { stats, error: statsError } = useAccountStats();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <AppShellHeader title="Account" />

      <ScrollBody className="pt-0">
        <div className="flex flex-col items-center pb-4 pt-1">
          <Avatar
            size={80}
            photoUrl={profile?.avatarUrl}
            initial={profile?.displayName ?? "?"}
          />
          <h2 className="mt-4 font-serif text-2xl text-text">
            {profile?.displayName ?? "…"}
          </h2>
          <p className="text-sm text-muted">
            {profile?.email ?? "Signed in with phone"}
          </p>
          <Link href="/account/settings" className={`${ui.textLink} mt-2`}>
            Edit profile
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <AccountNavRow href="/account/settings">Settings</AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow href="/account/settings#notifications">
            Notifications
          </AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow href="/account/settings#data">
            Privacy &amp; data
          </AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow href="/account/settings#help">Help</AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow onClick={() => setFeedbackOpen(true)}>
            Send feedback
          </AccountNavRow>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
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
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-left text-sm text-red transition hover:border-red/30"
          >
            Sign out
          </button>
        </form>
      </ScrollBody>

      <FeedbackSheet
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </main>
  );
};

export default AccountScreen;
