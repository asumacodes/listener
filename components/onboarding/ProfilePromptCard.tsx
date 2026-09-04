"use client";

import { GitHubIcon, GoogleIcon } from "@/components/auth/ProviderIcons";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { getUserInitial } from "@/lib/auth/session";
import type { OAuthProvider } from "@/types";
import { useRef } from "react";

type ProfilePromptCardProps = {
  title: string;
  body: string;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  photoUrl: string | null;
  onPickPhoto: (file: File | null) => void;
  onSave: () => void;
  saving: boolean;
  nameValid: boolean;
  error: string | null;
  onDismiss: () => void;
  onLink: (provider: OAuthProvider) => void;
  linking: OAuthProvider | null;
  showGoogle: boolean;
  showGitHub: boolean;
};

const ProfilePromptCard = ({
  title,
  body,
  displayName,
  onDisplayNameChange,
  photoUrl,
  onPickPhoto,
  onSave,
  saving,
  nameValid,
  error,
  onDismiss,
  onLink,
  linking,
  showGoogle,
  showGitHub,
}: ProfilePromptCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showLinkRow = showGoogle || showGitHub;

  return (
    <div
      role="region"
      aria-label={title}
      className={`${ui.cardFlat} relative shrink-0 px-5 py-4 pr-12`}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3.5 text-[15px] text-muted transition hover:text-text"
      >
        ×
      </button>
      <h2 className="font-serif text-[18px] leading-tight tracking-[-0.01em] text-text">
        {title}
      </h2>
      <p className="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-text-secondary">
        {body}
      </p>

      <form
        className="mt-4 flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-30)]"
          aria-label={
            photoUrl ? copy.onboarding.photoChange : copy.onboarding.photo
          }
        >
          <Avatar
            size={48}
            photoUrl={photoUrl}
            initial={getUserInitial(displayName || "?")}
          />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/webp,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = "";
            onPickPhoto(file);
          }}
        />
        <Input
          id="profile-prompt-name"
          name="displayName"
          autoComplete="name"
          maxLength={80}
          placeholder={copy.onboarding.namePlaceholder}
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          aria-label={copy.onboarding.nameLabel}
          className="min-w-[200px] flex-1 !py-2.5"
        />
        <Button
          type="submit"
          disabled={!nameValid || saving}
          className="!min-h-[42px] shrink-0 px-5 text-sm"
        >
          {saving ? copy.onboarding.saving : copy.profilePrompt.save}
        </Button>
      </form>

      {error ? (
        <p className="mt-2 text-[13px] text-red" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button type="button" onClick={onDismiss} className={ui.textLink}>
          {copy.onboarding.skip}
        </button>
        {showLinkRow ? (
          <>
            <span className="text-[13px] text-muted">·</span>
            <span className="text-[13px] text-muted">
              {copy.profilePrompt.linkLead}
            </span>
            {showGoogle ? (
              <button
                type="button"
                disabled={linking !== null}
                onClick={() => onLink("google")}
                className={`${ui.textLink} inline-flex items-center gap-1.5`}
              >
                <GoogleIcon className="h-3.5 w-3.5" />
                {linking === "google" ? "…" : copy.settings.linkGoogle}
              </button>
            ) : null}
            {showGitHub ? (
              <button
                type="button"
                disabled={linking !== null}
                onClick={() => onLink("github")}
                className={`${ui.textLink} inline-flex items-center gap-1.5`}
              >
                <GitHubIcon className="h-3.5 w-3.5" />
                {linking === "github" ? "…" : copy.settings.linkGitHub}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProfilePromptCard;
