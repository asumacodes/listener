"use client";

import DeleteAccountSheet from "@/components/confirm/DeleteAccountSheet";
import { IconPencil } from "@/components/icons/ListenerIcons";
import AppShellHeader, { BackButton } from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { deleteAccount } from "@/lib/account/delete";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const fieldLabelClass = `${ui.eyebrow} mb-2 block text-gold-deep`;

type AtlassianStatus = {
  connected: boolean;
  siteUrl?: string;
};

const SettingsScreen = () => {
  const profile = useProfile();
  const router = useRouter();
  const profileName = profile?.displayName ?? "";
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const displayName = nameDraft ?? profileName;

  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [atlassian, setAtlassian] = useState<AtlassianStatus | null>(null);

  useEffect(() => {
    fetch("/api/integrations/atlassian/status")
      .then((r) => r.json())
      .then(setAtlassian)
      .catch(() => setAtlassian({ connected: false }));
  }, []);

  const handleSave = () => {
    setNameDraft(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      try {
        await createClient().auth.signOut();
      } catch {
        // The auth row is already gone server-side; navigate even if local
        // session cleanup cannot complete.
      }
      router.replace("/login");
    } finally {
      setDeleting(false);
    }
  };

  const handleDisconnectAtlassian = async () => {
    await fetch("/api/integrations/atlassian/disconnect", { method: "POST" });
    setAtlassian({ connected: false });
  };

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <AppShellHeader
        left={<BackButton onClick={() => router.push("/account")} />}
        title="Settings"
      />

      <ScrollBody className="gap-6 pb-8 pt-0">
        <section>
          <p className={`${ui.eyebrow} mb-3 text-gold-deep`}>
            {copy.settings.profile}
          </p>
          <div className={`${ui.card} space-y-5 p-4`}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar
                  size={64}
                  photoUrl={profile?.avatarUrl}
                  initial={profile?.displayName ?? "?"}
                />
                <span
                  className="absolute -right-0.5 -bottom-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-gold text-white"
                  aria-hidden
                >
                  <IconPencil size={12} />
                </span>
              </div>
              <button type="button" className={ui.textLink}>
                {copy.settings.changePhoto}
              </button>
            </div>

            <div>
              <label htmlFor="display-name" className={fieldLabelClass}>
                {copy.settings.displayName}
              </label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setNameDraft(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className={fieldLabelClass}>
                {copy.settings.email}
              </label>
              <Input
                id="email"
                type="email"
                value={profile?.email ?? ""}
                readOnly
                disabled
                readOnlyStyle
              />
              <p className="mt-2 text-sm text-muted">
                {copy.settings.emailHint}
              </p>
            </div>

            <Button fullWidth onClick={handleSave}>
              {copy.settings.save}
            </Button>
            {saved ? (
              <p
                role="status"
                className="text-center text-sm text-success-text"
              >
                {copy.settings.saved} (placeholder — backend pending)
              </p>
            ) : null}
          </div>
        </section>

        <section>
          <p className={`${ui.eyebrow} mb-3 text-gold-deep`}>Integrations</p>
          <div className={`${ui.card} space-y-4 p-4`}>
            <div>
              <p className="text-sm text-muted">
                Connect your{" "}
                <span className="font-semibold text-text">Atlassian</span>{" "}
                account so your Jira board and Confluence docs are created in
                your own workspace.
              </p>
            </div>

            {atlassian?.connected ? (
              <div className="space-y-3">
                <Button
                  variant="retry"
                  fullWidth
                  onClick={handleDisconnectAtlassian}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                fullWidth
                onClick={() => {
                  window.location.href = "/api/integrations/atlassian/start";
                }}
              >
                Connect Atlassian
              </Button>
            )}
          </div>
        </section>

        <section id="data" className="scroll-mt-6">
          <p className={`${ui.eyebrow} mb-3 text-gold-deep`}>
            {copy.settings.dataRetention}
          </p>
          <div className={`${ui.card} space-y-4 p-4`}>
            <p className="text-sm leading-relaxed text-text">
              {copy.settings.dataRetentionBody}
            </p>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-sm font-medium text-text">
                {copy.settings.currentPlan}
              </span>
              <StatusBadge variant="ready" showDot={false}>
                {copy.settings.planFree}
              </StatusBadge>
            </div>
          </div>
        </section>

        <section>
          <p className={`${ui.eyebrow} mb-3 text-red`}>
            {copy.settings.dangerZone}
          </p>
          <div className={`${ui.card} p-4`}>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="w-full text-left"
            >
              <p className="text-sm font-medium text-red">
                {copy.settings.deleteAccount}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {copy.settings.deleteAccountHint}
              </p>
            </button>
          </div>
        </section>
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

export default SettingsScreen;
