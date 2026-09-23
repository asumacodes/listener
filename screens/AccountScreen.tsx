"use client";

import AccountNavRow from "@/components/account/AccountNavRow";
import FeedbackSheet from "@/components/feedback/FeedbackSheet";
import SupportSheet from "@/components/support/SupportSheet";
import Avatar from "@/components/ui/Avatar";
import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import useAccountStats from "@/hooks/useAccountStats";
import usePlanSummary from "@/hooks/usePlanSummary";
import { useProfile, useProfileLoaded } from "@/hooks/useProfile";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";
import Link from "next/link";
import { useState } from "react";

const AccountScreen = () => {
  const profile = useProfile();
  const profileLoaded = useProfileLoaded();
  const { stats, error: statsError, loading: statsLoading } = useAccountStats();
  const { rowSub, loading: planLoading } = usePlanSummary();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <AppShellHeader title="Account" />

      <ScrollBody className="pt-0">
        <div className="flex flex-col items-center pb-4 pt-1">
          {profileLoaded ? (
            <>
              <Avatar
                size={80}
                photoUrl={profile?.avatarUrl}
                initial={profile?.displayName ?? "?"}
              />
              {profile ? (
                <>
                  <h2 className="mt-4 font-serif text-2xl text-text">
                    {profile.displayName}
                  </h2>
                  <p className="text-sm text-muted">
                    {/* Only a loaded profile with no email is a phone sign-in. */}
                    {profile.email ?? "Signed in with phone"}
                  </p>
                </>
              ) : null}
            </>
          ) : (
            <div
              role="status"
              aria-busy="true"
              aria-label={copy.settings.loadingProfile}
              className="flex flex-col items-center"
            >
              <SkeletonBar className="h-20 w-20 rounded-full" />
              <SkeletonBar className="mt-4 h-7 w-40" />
              <SkeletonBar className="mt-2 h-4 w-48" />
            </div>
          )}
          <Link href="/account/settings" className={`${ui.textLink} mt-2`}>
            Edit profile
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <AccountNavRow href="/account/settings">Settings</AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow href="/account/plan">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span>{copy.plan.title}</span>
              {rowSub ? (
                <span className="truncate text-xs text-muted">{rowSub}</span>
              ) : planLoading ? (
                <SkeletonBar className="h-3 w-40" />
              ) : null}
            </span>
          </AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow href="/account/settings#notifications">
            Notifications
          </AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow href="/account/settings#data">
            Privacy &amp; data
          </AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow onClick={() => setSupportOpen(true)}>
            Contact support
          </AccountNavRow>
          <div className="h-px bg-border" />
          <AccountNavRow onClick={() => setFeedbackOpen(true)}>
            Send feedback
          </AccountNavRow>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-text">Recordings</span>
            {statsLoading ? (
              <SkeletonBar className="h-4 w-8" />
            ) : (
              <span className="text-sm text-muted">
                {stats?.recordings ?? "—"}
              </span>
            )}
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-text">Projects</span>
            {statsLoading ? (
              <SkeletonBar className="h-4 w-8" />
            ) : (
              <span className="text-sm text-muted">
                {stats?.projects ?? "—"}
              </span>
            )}
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
      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    </main>
  );
};

export default AccountScreen;
