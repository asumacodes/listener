"use client";

import DesktopAuthShell from "@/components/desktop/auth/DesktopAuthShell";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthLegalConsent from "@/components/auth/AuthLegalConsent";
import OAuthButtons from "@/components/auth/OAuthButtons";
import OAuthRedirectSurface from "@/components/auth/OAuthRedirectSurface";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import Toast from "@/components/ui/Toast";
import { formatPhoneInternational } from "@/lib/auth/phone";
import type { AuthActions, AuthState } from "@/types/auth";
import { useCallback } from "react";

type DesktopAuthScreenProps = {
  authState: AuthState;
  actions: AuthActions;
};

const DesktopAuthScreen = ({ authState, actions }: DesktopAuthScreenProps) => {
  const {
    oauthRedirect,
    error,
    countryCode,
    nationalNumber,
    phoneE164,
    otp,
    otpSent,
    isSendingOtp,
    isVerifyingOtp,
    legalAccepted,
    setCountryCode,
    setNationalNumber,
    setOtp,
    setCaptchaToken,
    setLegalAccepted,
    setError,
  } = authState;
  const { handleOAuth, sendPhoneOtp, verifyPhoneOtp, backFromOtp } = actions;
  const dismissError = useCallback(() => setError(null), [setError]);

  if (oauthRedirect) {
    return <OAuthRedirectSurface provider={oauthRedirect} />;
  }

  return (
    <DesktopAuthShell formOnWhite={otpSent}>
      {otpSent ? (
        <div className="mx-auto w-full max-w-[420px]">
          <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
            Step 2 of 2
          </p>
          <h2 className="mt-3.5 font-serif text-[42px] leading-[1.1] text-text">
            Enter the code
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
            We texted a code to{" "}
            {phoneE164 ? formatPhoneInternational(phoneE164) : "your phone"}.
          </p>
          <div className="mt-8">
            <PhoneOtpForm
              countryCode={countryCode}
              nationalNumber={nationalNumber}
              otp={otp}
              otpSent
              isSendingOtp={isSendingOtp}
              isVerifyingOtp={isVerifyingOtp}
              legalAccepted={legalAccepted}
              onCountryCodeChange={setCountryCode}
              onNationalNumberChange={setNationalNumber}
              onOtpChange={setOtp}
              onCaptchaToken={setCaptchaToken}
              onSend={sendPhoneOtp}
              onVerify={verifyPhoneOtp}
              onBack={backFromOtp}
              digitBoxClassName="h-[68px] min-w-[62px] flex-none text-2xl"
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[420px]">
          <h2 className="font-serif text-[42px] leading-[1.1] text-text">
            Sign in
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
            Use your phone, Google, or GitHub to open your studio.
          </p>
          <div className="mt-8 space-y-[22px]">
            <PhoneOtpForm
              countryCode={countryCode}
              nationalNumber={nationalNumber}
              otp={otp}
              otpSent={false}
              isSendingOtp={isSendingOtp}
              isVerifyingOtp={isVerifyingOtp}
              legalAccepted={legalAccepted}
              onCountryCodeChange={setCountryCode}
              onNationalNumberChange={setNationalNumber}
              onOtpChange={setOtp}
              onCaptchaToken={setCaptchaToken}
              onSend={sendPhoneOtp}
              onVerify={verifyPhoneOtp}
              onBack={backFromOtp}
            />
            <AuthLegalConsent
              checked={legalAccepted}
              onCheckedChange={setLegalAccepted}
            />
            <AuthDivider />
            <OAuthButtons onOAuth={handleOAuth} disabled={!legalAccepted} />
          </div>
          <p className="mt-[30px] text-xs leading-relaxed text-muted">
            Trouble signing in?{" "}
            <a
              href="mailto:support@trymurmur.studio"
              className="text-gold-deep"
            >
              Get help
            </a>
          </p>
        </div>
      )}
      {error ? <Toast message={error} onDismiss={dismissError} /> : null}
    </DesktopAuthShell>
  );
};

export default DesktopAuthScreen;
