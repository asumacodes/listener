"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthMode, OAuthProvider } from "@/types";
import type { AuthActions, AuthState } from "@/types/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback } from "react";

const authCallbackUrl = () => `${window.location.origin}/auth/callback`;

const useAuthActions = (authState: AuthState): AuthActions => {
  const router = useRouter();
  const supabase = createClient();

  const {
    email,
    password,
    mode,
    setMode,
    setIsLoading,
    setIsResending,
    setShowCheckEmail,
    setOauthRedirect,
    setEmailBanner,
    setError,
  } = authState;

  const switchMode = useCallback(
    (next: AuthMode) => {
      setMode(next);
      setError(null);
      setEmailBanner(null);
      setShowCheckEmail(false);
    },
    [setMode, setError, setEmailBanner, setShowCheckEmail]
  );

  const backFromCheckEmail = useCallback(() => {
    setShowCheckEmail(false);
    setEmailBanner(null);
    switchMode("signin");
  }, [setShowCheckEmail, setEmailBanner, switchMode]);

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setEmailBanner(null);

      const fn =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: authCallbackUrl(),
              },
            });

      const { error: authError } = await fn;
      setIsLoading(false);

      if (authError) {
        setError(authError.message);
        return;
      }

      if (mode === "signup") {
        setShowCheckEmail(true);
        return;
      }

      router.push("/");
      router.refresh();
    },
    [
      mode,
      email,
      password,
      supabase,
      setIsLoading,
      setError,
      setEmailBanner,
      setShowCheckEmail,
      router,
    ]
  );

  const handleResend = useCallback(async () => {
    if (!email) return;
    setIsResending(true);
    setError(null);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setIsResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setEmailBanner(`Check your email — sent to ${email}`);
  }, [email, supabase, setIsResending, setError, setEmailBanner]);

  const handleOAuth = useCallback(
    async (provider: OAuthProvider) => {
      setError(null);
      setEmailBanner(null);
      setOauthRedirect(provider);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authCallbackUrl(),
        },
      });

      if (oauthError) {
        setOauthRedirect(null);
        setError(oauthError.message);
      }
    },
    [supabase, setError, setEmailBanner, setOauthRedirect]
  );

  return {
    switchMode,
    backFromCheckEmail,
    handleEmailSubmit,
    handleResend,
    handleOAuth,
  };
};

export default useAuthActions;
