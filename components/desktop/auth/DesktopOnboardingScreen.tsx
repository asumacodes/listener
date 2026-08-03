"use client";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { isAcceptedImage } from "@/lib/profile/image";
import { ProfileSaveError, saveProfile } from "@/lib/profile/save";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAME_MAX = 80;

const STEPS = [
  {
    title: "Your profile",
    sub: "A name and, if you like, a photo.",
    state: "active" as const,
  },
  {
    title: "Connect Atlassian",
    sub: "Optional. Can be done later in Settings.",
    state: "upcoming" as const,
  },
  {
    title: "Your first idea",
    sub: "A short guided run, start to finish.",
    state: "upcoming" as const,
  },
];

/** Desktop onboarding — step spine + profile card (KAN-58 extends spine). */
const DesktopOnboardingScreen = () => {
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
          Skip for now
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[320px] shrink-0 flex-col gap-[22px] border-r border-border px-10 py-12">
          <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
            Getting set up
          </p>
          <ol className="relative space-y-7 border-l border-border pl-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span
                  className={`absolute top-1 -left-[1.55rem] h-2.5 w-2.5 rounded-full ${
                    step.state === "active"
                      ? "bg-gold"
                      : "border border-border bg-canvas"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    step.state === "active" ? "text-text" : "text-muted"
                  }`}
                >
                  {i + 1}. {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {step.sub}
                </p>
              </li>
            ))}
          </ol>
          {/* KAN-58: first-run walkthrough steps append to this spine */}
          <div className="mt-auto rounded-xl border border-dashed border-dashed-border px-3 py-3 text-[10px] tracking-wide text-muted uppercase">
            Extension point
          </div>
        </aside>

        <div className="flex flex-1 items-start justify-center px-10 py-12">
          <div className="w-full max-w-[460px] rounded-3xl border border-border bg-surface px-11 py-12 shadow-card">
            <h1 className="font-serif text-[38px] leading-[1.1] text-text">
              Set up your profile
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Add a name so your studio feels like yours. Photo is optional.
            </p>

            <form
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
                <FieldLabel htmlFor="desktop-onboard-name">
                  Your name
                </FieldLabel>
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

              {error ? <p className="text-sm text-red">{error}</p> : null}

              <Button type="submit" fullWidth disabled={!nameValid || saving}>
                {saving ? "Saving…" : "Continue to studio"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DesktopOnboardingScreen;
