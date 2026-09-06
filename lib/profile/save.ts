// KAN-38 item 3: profile save — display name + optional avatar.
// Mirrors the saveRecording template: auth → provision RPC → storage upload
// → DB write. Always writes both columns from the form's DB-shaped state
// (display_name + the RAW avatar_url path — never the resolved UserProfile.avatarUrl).

import { isValidEmail, normaliseProfileEmail } from "@/lib/profile/email";
import { normaliseAvatar } from "@/lib/profile/image";
import { createClient } from "@/lib/supabase/client";

const AVATARS_BUCKET = "avatars";

export type SaveProfileArgs = {
  displayName: string;
  /**
   * The raw, DB-shaped avatar_url the form loaded (a storage path like
   * "{userId}/avatar", or an OAuth https URL, or null). Written back as-is on a
   * name-only save. Replaced with the fixed storage path when avatarFile is set.
   */
  avatarPath: string | null;
  /** A newly-picked image to upload this save, or null for a name-only save. */
  avatarFile: File | null;
  /**
   * Onboarding only. Omitted by Settings / ProfilePromptCard.
   * Non-empty string is written; undefined / null / "" leave the column alone.
   * Auth-side sync is null-only (see identities.ts) so a hand-entered value survives OAuth link.
   */
  email?: string | null;
};

export class ProfileSaveError extends Error {
  constructor(
    message: string,
    public code:
      | "NOT_AUTHENTICATED"
      | "PROVISIONING_FAILED"
      | "AVATAR_UPLOAD_FAILED"
      | "UPDATE_FAILED"
      | "INVALID_NAME"
      | "INVALID_EMAIL"
  ) {
    super(message);
    this.name = "ProfileSaveError";
  }
}

const MIN_NAME = 1;
const MAX_NAME = 80;

export const saveProfile = async ({
  displayName,
  avatarPath,
  avatarFile,
  email,
}: SaveProfileArgs): Promise<{ avatarPath: string | null }> => {
  const name = displayName.trim();
  if (name.length < MIN_NAME || name.length > MAX_NAME) {
    throw new ProfileSaveError(
      `Name must be ${MIN_NAME}–${MAX_NAME} characters`,
      "INVALID_NAME"
    );
  }

  const nextEmail = normaliseProfileEmail(email);
  if (nextEmail && !isValidEmail(nextEmail)) {
    throw new ProfileSaveError(
      "Enter a valid email, or leave it blank",
      "INVALID_EMAIL"
    );
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new ProfileSaveError("Not authenticated", "NOT_AUTHENTICATED");
  }

  const { error: provisionErr } = await supabase.rpc("ensure_user_provisioned");
  if (provisionErr) {
    throw new ProfileSaveError(
      `Provisioning check failed: ${provisionErr.message}`,
      "PROVISIONING_FAILED"
    );
  }

  let nextAvatarPath = avatarPath;

  if (avatarFile) {
    const { blob, contentType } = await normaliseAvatar(avatarFile);
    const storagePath = `${user.id}/avatar`;

    const { error: uploadErr } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(storagePath, blob, { contentType, upsert: true });

    if (uploadErr) {
      throw new ProfileSaveError(
        `Avatar upload failed: ${uploadErr.message}`,
        "AVATAR_UPLOAD_FAILED"
      );
    }

    nextAvatarPath = storagePath;
  }

  const patch: {
    display_name: string;
    avatar_url: string | null;
    email?: string;
  } = {
    display_name: name,
    avatar_url: nextAvatarPath,
  };
  if (nextEmail) patch.email = nextEmail;

  const { error: updateErr } = await supabase
    .from("users")
    .update(patch)
    .eq("id", user.id);

  if (updateErr) {
    throw new ProfileSaveError(
      `Save failed: ${updateErr.message}`,
      "UPDATE_FAILED"
    );
  }

  return { avatarPath: nextAvatarPath };
};
