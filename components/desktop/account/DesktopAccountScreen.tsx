"use client";

import AccountNavRow from "@/components/account/AccountNavRow";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import useAccountStats from "@/hooks/useAccountStats";
import { useProfile } from "@/hooks/useProfile";
import { ui } from "@/lib/design/ui";
import Link from "next/link";

/**
 * Desktop account overview — centered 880px column per mock.
 * Rail comes from DesktopShell; this fills the main pane only.
 */
const DesktopAccountScreen = () => {
  const profile = useProfile();
  const { stats, error: statsError } = useAccountStats();

  const contactLine = [profile?.email].filter(Boolean).join(" · ");

  const rowClass = "h-[62px] px-[26px] py-0 gap-3.5 hover:bg-black/[0.02]";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-[22px] px-8 py-10">
        <h1 className="font-serif text-[27px] leading-none text-text">
          Account
        </h1>

        <section className={`${ui.card} flex items-center gap-5 px-6 py-5`}>
          <Avatar
            size={76}
            photoUrl={profile?.avatarUrl}
            initial={profile?.displayName ?? "?"}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-serif text-[26px] leading-tight text-text">
              {profile?.displayName ?? "…"}
            </h2>
            <p className="mt-1 truncate text-sm text-muted">
              {contactLine || "Signed in with phone"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-7">
            <div className="flex flex-col items-end gap-1">
              <p className="font-serif text-[28px] leading-none text-text">
                {stats?.recordings ?? "—"}
              </p>
              <p className={ui.eyebrow}>Recordings</p>
            </div>
            <div className="h-10 w-px bg-border" aria-hidden />
            <div className="flex flex-col items-end gap-1">
              <p className="font-serif text-[28px] leading-none text-text">
                {stats?.projects ?? "—"}
              </p>
              <p className={ui.eyebrow}>Projects</p>
            </div>
            <Link href="/account/settings">
              <Button
                variant="outline"
                className="!min-h-9 rounded-full px-[18px] text-[13px]"
              >
                Edit profile
              </Button>
            </Link>
          </div>
        </section>
        {statsError ? <p className="text-xs text-red">{statsError}</p> : null}

        <section className={`${ui.card} overflow-hidden`}>
          <AccountNavRow href="/account/settings" className={rowClass}>
            <span className="flex min-w-0 items-center gap-3.5">
              <span className="font-medium">Settings</span>
              <span className="text-xs text-muted">
                Profile, integrations, plan
              </span>
            </span>
          </AccountNavRow>
          <AccountNavRow
            href="/account/settings#notifications"
            className={`${rowClass} border-t border-border`}
          >
            <span className="flex min-w-0 items-center gap-3.5">
              <span className="font-medium">Notifications</span>
              <span className="text-xs text-muted">On for finished runs</span>
            </span>
          </AccountNavRow>
          <AccountNavRow
            href="/account/settings#data"
            className={`${rowClass} border-t border-border`}
          >
            <span className="flex min-w-0 items-center gap-3.5">
              <span className="font-medium">Privacy &amp; data</span>
              <span className="text-xs text-muted">
                Retention, export, deletion
              </span>
            </span>
          </AccountNavRow>
          <AccountNavRow
            href="/account/settings#help"
            className={`${rowClass} border-t border-border`}
          >
            <span className="flex min-w-0 items-center gap-3.5">
              <span className="font-medium">Help</span>
              <span className="text-xs text-muted">
                How a run works, contact us
              </span>
            </span>
          </AccountNavRow>
        </section>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted">
            Listener 0.1 · signed in on this device
          </p>
          <form action="/auth/logout" method="post">
            <Button
              type="submit"
              variant="danger"
              className="!min-h-9 rounded-full px-[18px] text-[13px]"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesktopAccountScreen;
