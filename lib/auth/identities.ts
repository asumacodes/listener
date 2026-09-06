import { createClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/types";

export type LinkedIdentityProvider = OAuthProvider | "phone";

export type LinkedIdentitySummary = {
  provider: string;
  identityId: string;
  email: string | null;
};

const SETTINGS_PATH = "/account/settings";

export const getLinkRedirectUrl = (
  provider: OAuthProvider,
  nextPath = SETTINGS_PATH
) => {
  const next = `${nextPath}?linked=${provider}`;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
};

export const listLinkedIdentities = async (): Promise<
  LinkedIdentitySummary[]
> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) throw error;

  return (data?.identities ?? []).map((identity) => {
    const meta = identity.identity_data as Record<string, unknown> | undefined;
    const emailFromMeta = typeof meta?.email === "string" ? meta.email : null;
    return {
      provider: identity.provider,
      identityId: identity.identity_id,
      email: emailFromMeta,
    };
  });
};

/** Start OAuth link flow — browser redirects to the provider. */
export const linkOAuthIdentity = async (
  provider: OAuthProvider,
  nextPath = SETTINGS_PATH
) => {
  const supabase = createClient();
  return supabase.auth.linkIdentity({
    provider,
    options: { redirectTo: getLinkRedirectUrl(provider, nextPath) },
  });
};

export const unlinkOAuthIdentity = async (provider: OAuthProvider) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) throw error;

  const identities = data?.identities ?? [];
  if (identities.length < 2) {
    throw new Error("single_identity_not_deletable");
  }

  const identity = identities.find((item) => item.provider === provider);
  if (!identity) {
    throw new Error("identity_not_found");
  }

  return supabase.auth.unlinkIdentity(identity);
};

/**
 * After a successful OAuth link, fill public.users.email from auth when blank.
 * Null-only — never overwrite a hand-entered address (see saveProfile).
 */
export const syncProfileEmailFromAuth = async (): Promise<string | null> => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const email = typeof user.email === "string" ? user.email : null;
  if (!email) return null;

  // null-only: auth may fill a blank email, never overwrite a hand-entered one.
  await supabase
    .from("users")
    .update({ email })
    .eq("id", user.id)
    .is("email", null);
  return email;
};
