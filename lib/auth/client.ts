import { createClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/types";

export const getAuthCallbackUrl = () =>
  `${window.location.origin}/auth/callback`;

export const signInWithOAuthProvider = (provider: OAuthProvider) => {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: getAuthCallbackUrl() },
  });
};
