import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/types";

export const getAuthCallbackUrl = (next?: string | null) => {
  const path = safeNextPath(next ?? null);
  const base = `${window.location.origin}/auth/callback`;
  return path === "/" ? base : `${base}?next=${encodeURIComponent(path)}`;
};

export const signInWithOAuthProvider = (
  provider: OAuthProvider,
  next?: string | null
) => {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: getAuthCallbackUrl(next) },
  });
};

export type PhoneOtpOptions = {
  captchaToken?: string;
};

export const signInWithPhoneOtp = (
  phone: string,
  options: PhoneOtpOptions = {}
) => {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    phone,
    options: {
      ...(options.captchaToken ? { captchaToken: options.captchaToken } : {}),
    },
  });
};

export const verifyPhoneOtp = (phone: string, token: string) => {
  const supabase = createClient();
  return supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
};

export const signOut = async (): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
