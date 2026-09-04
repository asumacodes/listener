"use client";

import { getSessionUser } from "@/lib/auth/session";
import { linkOAuthIdentity, listLinkedIdentities } from "@/lib/auth/identities";
import { copy } from "@/lib/design/copy";
import { identityLinkErrorMessage } from "@/lib/errors";
import {
  readProfilePromptDismissed,
  writeProfilePromptDismissed,
} from "@/lib/onboarding/profilePromptDismiss";
import { fetchProfileFormSeed } from "@/lib/profile/client";
import { isAcceptedImage } from "@/lib/profile/image";
import { ProfileSaveError, saveProfile } from "@/lib/profile/save";
import { useProfile, useRefreshProfile } from "./useProfile";
import type { DesktopIdeaCardModel } from "@/types/desktop";
import type { OAuthProvider } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

const NAME_MAX = 80;
const STUDIO_PATH = "/projects";

type UseProfilePromptArgs = {
  ideas: DesktopIdeaCardModel[];
  ideasReady: boolean;
};

/**
 * Post-completion profile card. Eligibility latches on first resolved ideas
 * list for this mount — not on later running→done refetches. The grid
 * unmounts on navigation and remounts on /projects return; that remount is
 * the trigger (d).
 */
const useProfilePrompt = ({ ideas, ideasReady }: UseProfilePromptArgs) => {
  const profile = useProfile();
  const refreshProfile = useRefreshProfile();
  const doneLatchRef = useRef<boolean | null>(null);

  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hadDoneOnEntry, setHadDoneOnEntry] = useState<boolean | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linking, setLinking] = useState<OAuthProvider | null>(null);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await getSessionUser();
      if (cancelled) return;
      const id = user?.id ?? null;
      setUserId(id);
      if (id) setDismissed(readProfilePromptDismissed(id));
      setSessionReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ideasReady) return;
    if (doneLatchRef.current !== null) return;
    const had = ideas.some((idea) => idea.status === "done");
    doneLatchRef.current = had;
    setHadDoneOnEntry(had);
  }, [ideasReady, ideas]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkError = params.get("link_error");
    if (params.get("linked") || linkError) {
      window.history.replaceState({}, "", STUDIO_PATH);
    }
    if (!linkError) return;
    const message = identityLinkErrorMessage({ code: linkError });
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setError(message);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const gateReady = sessionReady && hadDoneOnEntry !== null && profile !== null;

  const show =
    gateReady &&
    hadDoneOnEntry === true &&
    Boolean(profile?.needsOnboarding) &&
    !dismissed;

  useEffect(() => {
    if (!show) return;
    let active = true;
    void fetchProfileFormSeed()
      .then((seed) => {
        if (!active || !seed) return;
        setDisplayName(seed.displayName);
        setAvatarPath(seed.avatarPath);
      })
      .catch(() => {
        if (active) setError("Couldn't load your profile.");
      });
    return () => {
      active = false;
    };
  }, [show]);

  useEffect(() => {
    if (!show) return;
    let active = true;
    void listLinkedIdentities()
      .then((rows) => {
        if (!active) return;
        const has = (provider: string) =>
          rows.some((row) => row.provider === provider);
        setShowGoogle(!has("google"));
        setShowGitHub(!has("github"));
      })
      .catch(() => {
        if (active) {
          setShowGoogle(true);
          setShowGitHub(true);
        }
      });
    return () => {
      active = false;
    };
  }, [show]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (userId) writeProfilePromptDismissed(userId);
  }, [userId]);

  const pickPhoto = useCallback((file: File | null) => {
    if (!file) return;
    setError(null);
    if (!isAcceptedImage(file)) {
      setError("Please choose a WebP, PNG, or JPEG image.");
      return;
    }
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  }, []);

  const nameTrimmed = displayName.trim();
  const nameValid = nameTrimmed.length >= 1 && nameTrimmed.length <= NAME_MAX;

  const save = useCallback(async () => {
    if (!nameValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveProfile({
        displayName: nameTrimmed,
        avatarPath,
        avatarFile: pendingFile,
      });
      await refreshProfile();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
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
  }, [
    avatarPath,
    nameTrimmed,
    nameValid,
    pendingFile,
    previewUrl,
    refreshProfile,
    saving,
  ]);

  const link = useCallback(async (provider: OAuthProvider) => {
    setError(null);
    setLinking(provider);
    try {
      const { error: linkErr } = await linkOAuthIdentity(provider, STUDIO_PATH);
      if (linkErr) {
        setError(identityLinkErrorMessage(linkErr));
        setLinking(null);
      }
    } catch (err) {
      setError(identityLinkErrorMessage(err));
      setLinking(null);
    }
  }, []);

  return {
    show,
    title: copy.profilePrompt.title,
    body: copy.profilePrompt.body,
    displayName,
    setDisplayName,
    photoUrl: previewUrl ?? profile?.avatarUrl ?? null,
    pickPhoto,
    save,
    saving,
    nameValid,
    error,
    dismiss,
    link,
    linking,
    showGoogle,
    showGitHub,
  };
};

export default useProfilePrompt;
