"use client";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
import EmailInviteSurface from "@/components/auth/EmailInviteSurface";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import OAuthButtons from "@/components/auth/OAuthButtons";
import OAuthRedirectSurface from "@/components/auth/OAuthRedirectSurface";
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
    email,
    setEmail,
    password,
    setPassword,
    mode,
    isLoading,
    isResending,
    showCheckEmail,
    oauthRedirect,
    emailBanner,
    error,
  } = authState;

  const {
    switchMode,
    backFromCheckEmail,
    handleEmailSubmit,
    handleResend,
    handleOAuth,
  } = actions;

  const formRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!formRef.current || reduceMotion) return;
      gsap.fromTo(
        formRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      );
    },
    { dependencies: [mode, reduceMotion], scope: formRef, revertOnUpdate: true }
  );

  if (oauthRedirect) {
    return <OAuthRedirectSurface provider={oauthRedirect} />;
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col">
        {showCheckEmail ? (
          <EmailInviteSurface
            email={email}
            isResending={isResending}
            onResend={handleResend}
            onBack={backFromCheckEmail}
          />
        ) : (
          <div ref={formRef}>
            <AuthHeader mode={mode} />
            <div className="mt-8">
              <OAuthButtons onOAuth={handleOAuth} />
            </div>
            <AuthDivider />
            <EmailPasswordForm
              mode={mode}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
              onSubmit={handleEmailSubmit}
            />
            <AuthFooterLink mode={mode} onSwitch={switchMode} />
          </div>
        )}

        {emailBanner && (
          <p
            className="animate-fade-in mt-auto pt-6 text-center text-xs leading-relaxed text-emerald-800"
            role="status"
          >
            <span className="inline-block rounded-full bg-emerald-50 px-4 py-2">
              {emailBanner}
            </span>
          </p>
        )}

        {error && <AuthErrorBanner message={error} />}
      </div>
    </AuthLayout>
  );
};

export default AuthScreen;
