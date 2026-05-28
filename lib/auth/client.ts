import { createClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/types";

export const getAuthCallbackUrl = () =>
  `${window.location.origin}/auth/callback`;

export const signInWithPassword = (email: string, password: string) => {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithPassword = (email: string, password: string) => {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getAuthCallbackUrl() },
  });
};

export const resendSignupConfirmation = (email: string) => {
  const supabase = createClient();
  return supabase.auth.resend({ type: "signup", email });
};

export const signInWithOAuthProvider = (provider: OAuthProvider) => {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: getAuthCallbackUrl() },
  });
};
