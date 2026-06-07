"use client";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import AppShellHeader, { BackButton } from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SettingsPage = () => {
  const profile = useProfile();
  const router = useRouter();
  const [pipelineAlerts, setPipelineAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className={`${appShellClass} min-h-[calc(100dvh-4.5rem)]`}>
      <AppShellHeader
        left={<BackButton onClick={() => router.push("/account")} />}
        title="Settings"
      />

      <ScrollBody className="pb-8">
        <div className="flex flex-col items-center py-4">
          <Avatar
            size={72}
            photoUrl={profile?.avatarUrl}
            initial={profile?.displayName ?? "?"}
          />
          <h2 className="mt-4 font-serif text-2xl text-text">
            {profile?.displayName ?? "…"}
          </h2>
          <p className="text-sm text-muted">{profile?.email ?? ""}</p>
          <button type="button" className={`${ui.textLink} mt-2`}>
            Edit profile
          </button>
        </div>

        <section className="mt-6">
          <p className={`${ui.eyebrow} mb-3`}>Notifications</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <label className="flex items-center justify-between px-4 py-4">
              <span className="text-sm text-text">Pipeline finished</span>
              <input
                type="checkbox"
                checked={pipelineAlerts}
                onChange={(e) => setPipelineAlerts(e.target.checked)}
                className="h-5 w-5 accent-gold"
              />
            </label>
          </div>
        </section>

        <section className="mt-6">
          <p className={`${ui.eyebrow} mb-3`}>Integrations</p>
          <div className="rounded-2xl border border-dashed border-dashed-border bg-canvas px-4 py-6 text-center">
            <p className="text-sm text-text-secondary">
              Linear, Notion, and Slack connections will appear here.
            </p>
          </div>
        </section>

        <Button fullWidth className="mt-8" onClick={handleSave}>
          Save changes
        </Button>
        {saved ? (
          <p
            role="status"
            className="mt-3 text-center text-sm text-success-text"
          >
            Saved (placeholder — backend pending)
          </p>
        ) : null}

        <section className="mt-10">
          <p className={`${ui.eyebrow} mb-3 text-red`}>Danger zone</p>
          <p className="text-sm leading-relaxed text-text-secondary">
            Delete your account from the Account screen. Settings save is not
            wired yet.
          </p>
        </section>
      </ScrollBody>
    </main>
  );
};

export default SettingsPage;
