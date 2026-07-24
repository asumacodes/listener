"use client";

import AuthErrorBanner from "@/components/auth/AuthErrorBanner";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
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
  const { oauthRedirect, error } = authState;
  const { handleOAuth } = actions;

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
    { dependencies: [reduceMotion], scope: formRef, revertOnUpdate: true }
  );

  if (oauthRedirect) {
    return <OAuthRedirectSurface provider={oauthRedirect} />;
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col justify-center">
        <div ref={formRef} className="mx-auto w-full max-w-[330px]">
          <AuthHeader />
          <div className="mt-9">
            <OAuthButtons onOAuth={handleOAuth} />
          </div>
          {error ? <AuthErrorBanner message={error} /> : null}
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthScreen;
