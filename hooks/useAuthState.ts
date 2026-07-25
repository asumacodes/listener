"use client";

import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/auth/phone";
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
  const [countryCode, setCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE);
  const [nationalNumber, setNationalNumber] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  return {
    oauthRedirect,
    setOauthRedirect,
    error,
    setError,
    countryCode,
    setCountryCode,
    nationalNumber,
    setNationalNumber,
    phoneE164,
    setPhoneE164,
    otp,
    setOtp,
    otpSent,
    setOtpSent,
    isSendingOtp,
    setIsSendingOtp,
    isVerifyingOtp,
    setIsVerifyingOtp,
    captchaToken,
    setCaptchaToken,
  };
};

export default useAuthState;
