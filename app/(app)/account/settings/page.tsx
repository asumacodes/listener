"use client";

import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import { IconBack } from "@/components/icons/ListenerIcons";
import { appShellClass } from "@/lib/layout/shell";
import Link from "next/link";

const SettingsPage = () => (
  <main className={`${appShellClass} min-h-[calc(100dvh-4.5rem)]`}>
    <AppShellHeader
      left={
        <Link
          href="/account"
          aria-label="Back to account"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary transition hover:text-text"
        >
          <IconBack size={22} />
        </Link>
      }
      title="Settings"
    />
    <ScrollBody>
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <p className="text-sm text-text-secondary">
          Notification preferences and integrations will appear here.
        </p>
      </div>
    </ScrollBody>
  </main>
);

export default SettingsPage;
