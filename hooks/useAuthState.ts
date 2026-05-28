"use client";

import { AuthMode, OAuthProvider } from "@/types";
import type { AuthState } from "@/types/auth";
import { useState } from "react";

type UseAuthStateOptions = {
  initialError?: string | null;
};

const useAuthState = ({
  initialError = null,
}: UseAuthStateOptions = {}): AuthState => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [oauthRedirect, setOauthRedirect] = useState<OAuthProvider | null>(
    null
  );
  const [emailBanner, setEmailBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);

  return {
    email,
    setEmail,
    password,
    setPassword,
    mode,
    setMode,
    isLoading,
    setIsLoading,
    isResending,
    setIsResending,
    showCheckEmail,
    setShowCheckEmail,
    oauthRedirect,
    setOauthRedirect,
    emailBanner,
    setEmailBanner,
    error,
    setError,
  };
};

export default useAuthState;
