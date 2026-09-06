"use client";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { isValidEmail } from "@/lib/profile/email";
import { isAcceptedImage } from "@/lib/profile/image";
import { ProfileSaveError, saveProfile } from "@/lib/profile/save";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAME_MAX = 80;

/** Desktop onboarding — skippable profile form (KAN-58). */
const DesktopOnboardingScreen = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
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
  const emailTrimmed = email.trim();

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
    if (emailTrimmed && !isValidEmail(emailTrimmed)) {
      setError(copy.onboarding.emailInvalid);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveProfile({
        displayName: nameTrimmed,
        avatarPath: null,
        avatarFile: pendingFile,
        email: emailTrimmed || null,
      });
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ProfileSaveError && err.code === "INVALID_NAME") {
        setError("Enter a name between 1 and 80 characters.");
      } else if (
        err instanceof ProfileSaveError &&
        err.code === "INVALID_EMAIL"
      ) {
        setError(copy.onboarding.emailInvalid);
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
    <main className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-border bg-surface px-11">
        <div className="font-serif text-[22px] text-text">Listener</div>
        <button
          type="button"
          onClick={() => {
            router.replace("/");
            router.refresh();
          }}
          className="text-sm text-muted hover:text-text"
        >
          {copy.onboarding.skip}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-start justify-center px-10 py-12">
        <div className="w-[40vw] min-w-[min(100%,420px)] max-w-[720px] rounded-3xl border border-border bg-surface px-11 py-12 shadow-card">
          <h1 className="font-serif text-[38px] leading-[1.1] text-text">
            Set up your profile
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Add a name so your studio feels like yours. Photo is optional.
          </p>

          <form
            noValidate
            className="mt-9 space-y-7"
            onSubmit={(e) => {
              e.preventDefault();
              void handleContinue();
            }}
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-dashed border-gold/40 bg-gold-10 text-2xl text-gold"
                aria-label="Add a photo"
              >
                {previewUrl ? (
                  <Avatar size={80} photoUrl={previewUrl} initial="?" />
                ) : (
                  "+"
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-text">Add a photo</p>
                <p className="text-xs text-muted">PNG or JPG, up to 4 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePick}
              />
            </div>

            <div>
              <FieldLabel htmlFor="desktop-onboard-name">Your name</FieldLabel>
              <Input
                id="desktop-onboard-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                maxLength={NAME_MAX}
                autoComplete="name"
                className="h-[50px]"
              />
            </div>

            <div>
              <FieldLabel htmlFor="desktop-onboard-email">
                {copy.onboarding.emailLabel}
              </FieldLabel>
              <Input
                id="desktop-onboard-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.onboarding.emailPlaceholder}
                className="h-[50px]"
              />
              <p className="mt-2 text-[13px] text-muted">
                {copy.onboarding.emailHint}
              </p>
            </div>

            {error ? (
              <p className="text-sm text-red" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth disabled={!nameValid || saving}>
              {saving ? "Saving…" : "Continue to studio"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default DesktopOnboardingScreen;
