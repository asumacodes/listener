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
