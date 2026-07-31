"use client";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthIntro from "@/components/auth/AuthIntro";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthLegalConsent from "@/components/auth/AuthLegalConsent";
import AuthTagline from "@/components/auth/AuthTagline";
import OAuthButtons from "@/components/auth/OAuthButtons";
import OAuthRedirectSurface from "@/components/auth/OAuthRedirectSurface";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import Toast from "@/components/ui/Toast";
import { formatPhoneInternational } from "@/lib/auth/phone";
import { copy } from "@/lib/design/copy";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { AuthActions, AuthState } from "@/types/auth";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useRef } from "react";

type AuthScreenProps = {
  authState: AuthState;
  actions: AuthActions;
};

const AuthScreen = ({ authState, actions }: AuthScreenProps) => {
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
    setCountryCode,
    setNationalNumber,
    setOtp,
    setCaptchaToken,
    setError,
  } = authState;
  const { handleOAuth, sendPhoneOtp, verifyPhoneOtp, backFromOtp } = actions;

  const formRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const dismissError = useCallback(() => setError(null), [setError]);

  useGSAP(
    () => {
      if (!formRef.current || reduceMotion) return;
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    },
    {
      dependencies: [reduceMotion, otpSent, oauthRedirect],
      scope: formRef,
      revertOnUpdate: true,
    }
  );

  if (oauthRedirect) {
    return <OAuthRedirectSurface provider={oauthRedirect} />;
  }

  return (
    <AuthLayout>
      <div
        ref={formRef}
        className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-sm flex-col justify-between"
      >
        <AuthHeader />

        <div className="w-full">
          {otpSent ? (
            <AuthIntro
              headline={copy.auth.phone.otpHeadline}
              lead={copy.auth.phone.otpHint(
                phoneE164 ? formatPhoneInternational(phoneE164) : "your phone"
              )}
            />
          ) : (
            <AuthIntro />
          )}
          <div className="mt-8 space-y-5">
            <PhoneOtpForm
              countryCode={countryCode}
              nationalNumber={nationalNumber}
              otp={otp}
              otpSent={otpSent}
              isSendingOtp={isSendingOtp}
              isVerifyingOtp={isVerifyingOtp}
              onCountryCodeChange={setCountryCode}
              onNationalNumberChange={setNationalNumber}
              onOtpChange={setOtp}
              onCaptchaToken={setCaptchaToken}
              onSend={sendPhoneOtp}
              onVerify={verifyPhoneOtp}
              onBack={backFromOtp}
            />
            {!otpSent ? (
              <>
                <AuthDivider />
                <OAuthButtons onOAuth={handleOAuth} />
              </>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <AuthLegalConsent />
          <AuthTagline />
        </div>
      </div>

      {error ? <Toast message={error} onDismiss={dismissError} /> : null}
    </AuthLayout>
  );
};

export default AuthScreen;
