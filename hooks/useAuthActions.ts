"use client";

import { signInWithOAuthProvider } from "@/lib/auth/client";
import { OAuthProvider } from "@/types";
import type { AuthActions, AuthState } from "@/types/auth";
import { useCallback } from "react";

const useAuthActions = (authState: AuthState): AuthActions => {
  const { setOauthRedirect, setError } = authState;

  const handleOAuth = useCallback(
    async (provider: OAuthProvider) => {
      setError(null);
      setOauthRedirect(provider);
      const { error: oauthError } = await signInWithOAuthProvider(provider);
      if (oauthError) {
        setOauthRedirect(null);
        setError(oauthError.message);
      }
    },
    [setError, setOauthRedirect]
  );

  return { handleOAuth };
};

export default useAuthActions;
