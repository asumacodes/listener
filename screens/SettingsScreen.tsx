"use client";

import DeleteAccountSheet from "@/components/confirm/DeleteAccountSheet";
import AppShellHeader, { BackButton } from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import { useRefreshProfile } from "@/components/profile/ProfileProvider";
import NotificationsSettingsCard from "@/components/settings/NotificationsSettingsCard";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { deleteAccount } from "@/lib/account/delete";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { appShellClass } from "@/lib/layout/shell";
import { fetchProfileFormSeed } from "@/lib/profile/client";
import { isAcceptedImage } from "@/lib/profile/image";
import { ProfileSaveError, saveProfile } from "@/lib/profile/save";
import { createClient } from "@/lib/supabase/client";
import useAtlassianConnection from "@/hooks/useAtlassianConnection";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const fieldLabelClass = `${ui.eyebrow} mb-2 block text-gold-deep`;
const NAME_MAX = 80;

const SettingsScreen = () => {
  const profile = useProfile();
  const refreshProfile = useRefreshProfile();
  const router = useRouter();
  const { status: atlassian, disconnect: disconnectAtlassian } =
    useAtlassianConnection();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void fetchProfileFormSeed()
      .then((seed) => {
        if (!active) return;
        if (seed) {
          setDisplayName(seed.displayName);
          setInitialDisplayName(seed.displayName);
          setAvatarPath(seed.avatarPath);
          setSeeded(true);
        } else {
          setSeedError(true);
        }
      })
      .catch(() => {
        if (active) setSeedError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const nameError =
    displayName.trim().length < 1 || displayName.trim().length > NAME_MAX;

  const dirty =
    displayName.trim() !== initialDisplayName.trim() || pendingFile !== null;

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setSaved(false);
    if (!isAcceptedImage(file)) {
      setError("Please choose a WebP, PNG, or JPEG image.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (nameError || saving || !seeded || seedError || !dirty) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveProfile({
        displayName,
        avatarPath,
        avatarFile: pendingFile,
      });
      setAvatarPath(result.avatarPath);
      setInitialDisplayName(displayName.trim());
      await refreshProfile();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
      setSaved(true);
    } catch (err) {
      if (err instanceof ProfileSaveError) {
        if (err.code === "INVALID_NAME") {
          setError(null);
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong saving your profile.");
      }
    } finally {
      setSaving(false);
    }
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
    await disconnectAtlassian();
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
              <Avatar
                size={64}
                photoUrl={previewUrl ?? profile?.avatarUrl}
                initial={displayName || profile?.email || "?"}
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/webp,image/png,image/jpeg"
                  className="hidden"
                  onChange={handlePick}
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  {copy.settings.changePhoto}
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="display-name" className={fieldLabelClass}>
                {copy.settings.displayName}
              </label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSaved(false);
                }}
                hasError={displayName.length > 0 && nameError}
                maxLength={NAME_MAX}
                autoComplete="name"
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="email" className={fieldLabelClass}>
                {copy.settings.email}
              </label>
              <Input
                id="email"
                type="email"
                value={profile?.email ?? "Signed in with phone"}
                readOnly
                disabled
                readOnlyStyle
              />
              <p className="mt-2 text-sm text-muted">
                {profile?.email
                  ? copy.settings.emailHint
                  : "Phone accounts don’t have an email on file."}
              </p>
            </div>

            {seedError ? (
              <p className="text-sm text-red" role="alert">
                Could not load your profile. Please refresh and try again.
              </p>
            ) : null}

            {error ? (
              <p className="text-sm text-red" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              variant="primary"
              fullWidth
              onClick={handleSave}
              disabled={!seeded || seedError || !dirty || nameError || saving}
            >
              {saved ? copy.settings.saved : copy.settings.save}
            </Button>
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

        <section id="notifications" className="scroll-mt-6">
          <p className={`${ui.eyebrow} mb-3 text-gold-deep`}>
            {copy.settings.notifications}
          </p>
          <NotificationsSettingsCard />
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

      <DeleteAccountSheet
        open={deleteOpen}
        email={profile?.email ?? null}
        busy={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </main>
  );
};

export default SettingsScreen;
