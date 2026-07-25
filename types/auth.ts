import type { OAuthProvider } from "@/types";
import type { Dispatch, SetStateAction } from "react";

export type AuthState = {
  oauthRedirect: OAuthProvider | null;
  setOauthRedirect: Dispatch<SetStateAction<OAuthProvider | null>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  countryCode: string;
  setCountryCode: Dispatch<SetStateAction<string>>;
  nationalNumber: string;
  setNationalNumber: Dispatch<SetStateAction<string>>;
  /** E.164 composed on successful send — used for verify + OTP hint. */
  phoneE164: string | null;
  setPhoneE164: Dispatch<SetStateAction<string | null>>;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
  otpSent: boolean;
  setOtpSent: Dispatch<SetStateAction<boolean>>;
  isSendingOtp: boolean;
  setIsSendingOtp: Dispatch<SetStateAction<boolean>>;
  isVerifyingOtp: boolean;
  setIsVerifyingOtp: Dispatch<SetStateAction<boolean>>;
  captchaToken: string | null;
  setCaptchaToken: Dispatch<SetStateAction<string | null>>;
};

export type AuthActions = {
  handleOAuth: (provider: OAuthProvider) => Promise<void>;
  sendPhoneOtp: () => Promise<void>;
  /**
   * Verify the OTP. `otpOverride` lets auto-submit pass the just-typed code
   * before the `otp` state has re-rendered into this hook's closure.
   */
  verifyPhoneOtp: (otpOverride?: string) => Promise<void>;
  backFromOtp: () => void;
};
