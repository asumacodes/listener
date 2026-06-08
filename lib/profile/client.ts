import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/profile";

let profileCache: Promise<UserProfile | null> | null = null;

export const invalidateUserProfile = (): void => {
  profileCache = null;
};

const metadataAvatar = (metadata: Record<string, unknown>): string | null => {
  const picture = metadata.picture;
  if (typeof picture === "string" && picture.length > 0) return picture;
  const avatar = metadata.avatar_url;
  if (typeof avatar === "string" && avatar.length > 0) return avatar;
  return null;
};

const resolveAvatarUrl = async (
  raw: string | null | undefined,
  userMetadata: Record<string, unknown>
): Promise<string | null> => {
  const candidate = raw?.trim() || metadataAvatar(userMetadata);
  if (!candidate) return null;

  if (/^https?:\/\//i.test(candidate)) return candidate;

  const supabase = createClient();
  const buckets = ["avatars", "profiles"] as const;

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(candidate, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
  }

  return null;
};

const loadUserProfile = async (): Promise<UserProfile | null> => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data } = await supabase
    .from("users")
    .select("display_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const email =
    (typeof data?.email === "string" ? data.email : null) ?? user.email ?? "";
  if (!email) return null;

  const displayName =
    (typeof data?.display_name === "string" ? data.display_name : null) ??
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null) ??
    email.split("@")[0];

  const avatarUrl = await resolveAvatarUrl(
    typeof data?.avatar_url === "string" ? data.avatar_url : null,
    (user.user_metadata ?? {}) as Record<string, unknown>
  );

  return { displayName, email, avatarUrl };
};

/** Deduped profile fetch — one in-flight request per session. */
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  profileCache ??= loadUserProfile().catch((e) => {
    profileCache = null;
    throw e;
  });
  return profileCache;
};
