"use client";

import { OAuthProvider } from "@/types";
import type { AuthState } from "@/types/auth";
import { useState } from "react";

type UseAuthStateOptions = {
  initialError?: string | null;
};

const useAuthState = ({
  initialError = null,
}: UseAuthStateOptions = {}): AuthState => {
  const [oauthRedirect, setOauthRedirect] = useState<OAuthProvider | null>(
    null
  );
  const [error, setError] = useState<string | null>(initialError);

  return {
    oauthRedirect,
    setOauthRedirect,
    error,
    setError,
  };
};

export default useAuthState;
