"use client";

import AtlassianIntegrationCard from "@/components/desktop/account/AtlassianIntegrationCard";
import DeleteAccountSheet from "@/components/confirm/DeleteAccountSheet";
import { useRefreshProfile } from "@/components/profile/ProfileProvider";
import LinkedAccountsCard from "@/components/settings/LinkedAccountsCard";
import NotificationsSettingsCard from "@/components/settings/NotificationsSettingsCard";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import { StatusBadge } from "@/components/ui/Badge";
import useAtlassianConnection from "@/hooks/useAtlassianConnection";
import { useProfile } from "@/hooks/useProfile";
import { trackAtlassianConnected } from "@/lib/analytics/events";
import { deleteAccount } from "@/lib/account/delete";
import { signOut } from "@/lib/auth/client";
import { syncProfileEmailFromAuth } from "@/lib/auth/identities";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { identityLinkErrorMessage } from "@/lib/errors";
import { LEGAL_URLS } from "@/lib/legal";
import { fetchProfileFormSeed } from "@/lib/profile/client";
import { isAcceptedImage } from "@/lib/profile/image";
import { ProfileSaveError, saveProfile } from "@/lib/profile/save";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const fieldLabelClass = `${ui.eyebrow} mb-2 block`;
const NAME_MAX = 80;

const NAV_ITEMS = [
  { id: "profile", label: "Profile" },
  { id: "linked", label: "Linked accounts" },
  { id: "integrations", label: "Integrations" },
  { id: "notifications", label: "Notifications" },
  { id: "data", label: "Data & retention" },
  { id: "danger", label: "Danger zone" },
] as const;

/**
 * Desktop settings — secondary nav + card grid per mock.
 * Reuses the same save/link/Atlassian hooks as mobile SettingsScreen.
 */
const DesktopSettingsScreen = () => {
  const profile = useProfile();
  const refreshProfile = useRefreshProfile();
  const router = useRouter();
  const { status: atlassian, disconnect: disconnectAtlassian } =
    useAtlassianConnection();

  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") return "profile";
    const hash = window.location.hash.replace("#", "");
    return NAV_ITEMS.some((n) => n.id === hash) ? hash : "profile";
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localToast, setLocalToast] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);

  const searchParams = useSearchParams();
  const linkError = searchParams.get("link_error");
  const linked = searchParams.get("linked");

  const urlToast =
    linkError != null
      ? {
          message: identityLinkErrorMessage({ code: linkError }),
          variant: "error" as const,
        }
      : linked === "google" || linked === "github"
        ? {
            message: copy.settings.linkSuccess(
              linked === "google" ? "Google" : "GitHub"
            ),
            variant: "success" as const,
          }
        : null;

  const toast = localToast ?? urlToast;

  const dismissToast = useCallback(() => {
    setLocalToast(null);
    if (linkError != null || linked != null) {
      router.replace("/account/settings", { scroll: false });
    }
  }, [linkError, linked, router]);

  const showLinkMessage = useCallback((message: string | null) => {
    if (!message) {
      setLocalToast(null);
      return;
    }
    setLocalToast({ message, variant: "error" });
  }, []);

  useEffect(() => {
    if (linked !== "google" && linked !== "github") return;
    void (async () => {
      await syncProfileEmailFromAuth();
      await refreshProfile();
    })();
  }, [linked, refreshProfile]);

  useEffect(() => {
    if (searchParams.get("atlassian") !== "connected") return;
    trackAtlassianConnected(
      searchParams.get("context") === "pre_run" ? "pre_run" : "settings"
    );
    window.history.replaceState({}, "", "/account/settings");
  }, [searchParams]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && NAV_ITEMS.some((n) => n.id === hash)) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
        if (err.code !== "INVALID_NAME") setError(err.message);
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
        await signOut();
      } catch {
        // auth row already gone
      }
      router.replace("/login");
    } finally {
      setDeleting(false);
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* Top chrome — Account / Settings breadcrumb (mock A4) */}
      <header className="flex h-[78px] shrink-0 items-center gap-4 border-b border-border bg-canvas px-11">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          Account /
        </p>
        <h1 className="font-serif text-[27px] leading-none text-text">
          Settings
        </h1>
        <p className="ml-auto text-xs text-muted">
          All changes save to your account
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface px-4 py-[30px]">
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`flex h-[38px] w-full items-center rounded-xl px-3.5 text-left text-[13px] transition ${
                  activeSection === item.id
                    ? "bg-gold-10 font-semibold text-text"
                    : "text-text-secondary hover:bg-black/[0.03]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto px-11 py-[34px]">
          <div className="grid grid-cols-[1.35fr_1fr] gap-5">
            <section
              id="profile"
              className={`${ui.card} scroll-mt-6 space-y-5 p-5`}
            >
              <p className={fieldLabelClass}>{copy.settings.profile}</p>
              <div className="flex items-center gap-4">
                <Avatar
                  size={62}
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
                    className="!min-h-9 rounded-full px-4 text-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                  >
                    {copy.settings.changePhoto}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="desktop-display-name"
                    className={fieldLabelClass}
                  >
                    {copy.settings.displayName}
                  </label>
                  <Input
                    id="desktop-display-name"
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
                  <label htmlFor="desktop-email" className={fieldLabelClass}>
                    {copy.settings.email}
                  </label>
                  <Input
                    id="desktop-email"
                    type="email"
                    value={profile?.email ?? "Signed in with phone"}
                    readOnly
                    disabled
                    readOnlyStyle
                  />
                  <p className="mt-2 text-xs text-muted">
                    {profile?.email
                      ? copy.settings.emailHint
                      : "Phone accounts don’t have an email on file."}
                  </p>
                </div>
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
                onClick={handleSave}
                disabled={!seeded || seedError || !dirty || nameError || saving}
              >
                {saved ? copy.settings.saved : copy.settings.save}
              </Button>
            </section>

            <section
              id="linked"
              className={`${ui.card} scroll-mt-6 space-y-4 p-5`}
            >
              <p className={fieldLabelClass}>{copy.settings.linkedAccounts}</p>
              <LinkedAccountsCard
                onMessage={showLinkMessage}
                onLinked={refreshProfile}
              />
            </section>
          </div>

          <div className="mt-5">
            <section id="integrations" className="scroll-mt-6">
              <AtlassianIntegrationCard
                status={atlassian}
                onDisconnect={disconnectAtlassian}
              />
            </section>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_1.35fr] gap-5">
            <section
              id="notifications"
              className={`${ui.card} scroll-mt-6 space-y-4 p-5`}
            >
              <p className={fieldLabelClass}>{copy.settings.notifications}</p>
              <p className="text-sm leading-relaxed text-text-secondary">
                {copy.settings.notificationsBody}
              </p>
              <NotificationsSettingsCard />
            </section>

            <section
              id="data"
              className={`${ui.card} scroll-mt-6 space-y-4 p-5`}
            >
              <p className={fieldLabelClass}>{copy.settings.dataRetention}</p>
              <p className="text-sm leading-relaxed text-text">
                {copy.settings.dataRetentionBody}
              </p>
              <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                <a
                  href={LEGAL_URLS.privacy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ui.textLink}
                >
                  {copy.settings.privacyPolicy}
                </a>
                <a
                  href={LEGAL_URLS.terms}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ui.textLink}
                >
                  {copy.settings.termsOfService}
                </a>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-sm font-medium text-text">
                  {copy.settings.currentPlan}
                </span>
                <StatusBadge variant="ready" showDot={false}>
                  {copy.settings.planFree}
                </StatusBadge>
              </div>
            </section>
          </div>

          <div className="mt-5">
            <section
              id="danger"
              className="scroll-mt-6 flex items-center gap-6 rounded-2xl border border-border bg-surface px-[26px] py-[22px]"
            >
              <div className="min-w-0">
                <p className={`${ui.eyebrow} mb-1`}>
                  {copy.settings.dangerZone}
                </p>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  {copy.settings.deleteAccountHint}
                </p>
              </div>
              <Button
                variant="retry"
                className="!min-h-[38px] ml-auto shrink-0 rounded-full border-red px-[18px] text-[13px]"
                onClick={() => setDeleteOpen(true)}
              >
                {copy.settings.deleteAccount}
              </Button>
            </section>
          </div>
        </div>
      </div>

      <DeleteAccountSheet
        open={deleteOpen}
        email={profile?.email ?? null}
        busy={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  );
};

export default DesktopSettingsScreen;
