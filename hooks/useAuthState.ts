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
  const [phone, setPhone] = useState("");
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
    phone,
    setPhone,
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
