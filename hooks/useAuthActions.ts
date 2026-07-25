"use client";

import {
  signInWithOAuthProvider,
  signInWithPhoneOtp,
  verifyPhoneOtp as verifyPhoneOtpRequest,
} from "@/lib/auth/client";
import { composePhoneE164 } from "@/lib/auth/phone";
import { phoneAuthErrorMessage, phoneFormatErrorMessage } from "@/lib/errors";
import { OAuthProvider } from "@/types";
import type { AuthActions, AuthState } from "@/types/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const useAuthActions = (authState: AuthState): AuthActions => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    countryCode,
    nationalNumber,
    phoneE164,
    otp,
    captchaToken,
    setOauthRedirect,
    setError,
    setOtpSent,
    setIsSendingOtp,
    setIsVerifyingOtp,
    setOtp,
    setCaptchaToken,
    setPhoneE164,
  } = authState;

  const redirectAfterSignIn = useCallback(() => {
    const next = searchParams.get("next");
    router.replace(next && next.startsWith("/") ? next : "/");
  }, [router, searchParams]);

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

  const sendPhoneOtp = useCallback(async () => {
    setError(null);
    const normalized = composePhoneE164(countryCode, nationalNumber);
    if (!normalized) {
      setError(phoneFormatErrorMessage());
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (siteKey && !captchaToken) {
      setError(phoneAuthErrorMessage({ code: "captcha_failed" }));
      return;
    }

    setIsSendingOtp(true);
    try {
      const { error: sendError } = await signInWithPhoneOtp(normalized, {
        captchaToken: captchaToken ?? undefined,
      });
      if (sendError) {
        setError(phoneAuthErrorMessage(sendError));
        setCaptchaToken(null);
        return;
      }
      setPhoneE164(normalized);
      setOtpSent(true);
      setOtp("");
      setCaptchaToken(null);
    } finally {
      setIsSendingOtp(false);
    }
  }, [
    countryCode,
    nationalNumber,
    captchaToken,
    setError,
    setIsSendingOtp,
    setOtpSent,
    setOtp,
    setCaptchaToken,
    setPhoneE164,
  ]);

  const verifyPhoneOtp = useCallback(async () => {
    setError(null);
    const normalized =
      phoneE164 ?? composePhoneE164(countryCode, nationalNumber);
    if (!normalized) {
      setError(phoneFormatErrorMessage());
      return;
    }
    const token = otp.trim();
    if (!/^\d{6}$/.test(token)) {
      setError(phoneAuthErrorMessage({ code: "invalid_credentials" }));
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const { error: verifyError } = await verifyPhoneOtpRequest(
        normalized,
        token
      );
      if (verifyError) {
        setError(phoneAuthErrorMessage(verifyError));
        return;
      }
      redirectAfterSignIn();
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [
    phoneE164,
    countryCode,
    nationalNumber,
    otp,
    setError,
    setIsVerifyingOtp,
    redirectAfterSignIn,
  ]);

  const backFromOtp = useCallback(() => {
    setOtpSent(false);
    setOtp("");
    setPhoneE164(null);
    setError(null);
    setCaptchaToken(null);
  }, [setOtpSent, setOtp, setPhoneE164, setError, setCaptchaToken]);

  return { handleOAuth, sendPhoneOtp, verifyPhoneOtp, backFromOtp };
};

export default useAuthActions;
