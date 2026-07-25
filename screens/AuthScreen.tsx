"use client";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "@/components/auth/OAuthButtons";
import OAuthRedirectSurface from "@/components/auth/OAuthRedirectSurface";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { AuthActions, AuthState } from "@/types/auth";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

type AuthScreenProps = {
  authState: AuthState;
  actions: AuthActions;
};

const AuthScreen = ({ authState, actions }: AuthScreenProps) => {
  const {
    oauthRedirect,
    error,
    phone,
    otp,
    otpSent,
    isSendingOtp,
    isVerifyingOtp,
    setPhone,
    setOtp,
    setCaptchaToken,
  } = authState;
  const { handleOAuth, sendPhoneOtp, verifyPhoneOtp, backFromOtp } = actions;

  const formRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

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
      <div className="flex flex-1 flex-col justify-center">
        <div ref={formRef} className="mx-auto w-full max-w-[330px]">
          <AuthHeader />
          <div className="mt-9 space-y-6">
            <PhoneOtpForm
              phone={phone}
              otp={otp}
              otpSent={otpSent}
              isSendingOtp={isSendingOtp}
              isVerifyingOtp={isVerifyingOtp}
              onPhoneChange={setPhone}
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
          {error ? <AuthErrorBanner message={error} /> : null}
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthScreen;
