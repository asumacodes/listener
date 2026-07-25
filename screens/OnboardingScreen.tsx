"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { isAcceptedImage } from "@/lib/profile/image";
import { ProfileSaveError, saveProfile } from "@/lib/profile/save";
import { getUserInitial } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAME_MAX = 80;

const OnboardingScreen = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const nameTrimmed = displayName.trim();
  const nameValid = nameTrimmed.length >= 1 && nameTrimmed.length <= NAME_MAX;

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!isAcceptedImage(file)) {
      setError("Please choose a WebP, PNG, or JPEG image.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleContinue = async () => {
    if (!nameValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveProfile({
        displayName: nameTrimmed,
        avatarPath: null,
        avatarFile: pendingFile,
      });
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ProfileSaveError && err.code === "INVALID_NAME") {
        setError("Enter a name between 1 and 80 characters.");
      } else if (err instanceof ProfileSaveError) {
        setError(err.message);
      } else {
        setError("Something went wrong saving your profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-sm flex-col">
        <header className="flex flex-col items-center text-center">
          <div className="font-serif text-[28px] leading-none tracking-[-0.01em] text-gold">
            Listener
          </div>
          <h1 className="mt-10 font-serif text-[34px] leading-[1.15] tracking-[-0.01em] text-text">
            {copy.onboarding.headline}
          </h1>
          <p className="mt-2.5 max-w-[280px] text-[15px] leading-relaxed text-text-secondary">
            {copy.onboarding.lead}
          </p>
        </header>

        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleContinue();
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <Avatar
              size={88}
              photoUrl={previewUrl}
              initial={getUserInitial(nameTrimmed || "?")}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp,image/png,image/jpeg"
              className="hidden"
              onChange={handlePick}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-gold hover:brightness-110"
            >
              {pendingFile
                ? copy.onboarding.photoChange
                : copy.onboarding.photo}
            </button>
            <p className="text-center text-[13px] text-muted">
              {copy.onboarding.skipPhoto}
            </p>
          </div>

          <div>
            <FieldLabel htmlFor="onboarding-name">
              {copy.onboarding.nameLabel}
            </FieldLabel>
            <Input
              id="onboarding-name"
              name="displayName"
              autoComplete="name"
              autoFocus
              maxLength={NAME_MAX}
              placeholder={copy.onboarding.namePlaceholder}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {error ? (
            <p className="text-sm text-red" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={!nameValid || saving}>
            {saving ? copy.onboarding.saving : copy.onboarding.continue}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default OnboardingScreen;
