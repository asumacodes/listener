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
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      );
    },
    { dependencies: [reduceMotion], scope: formRef, revertOnUpdate: true }
  );

  if (oauthRedirect) {
    return <OAuthRedirectSurface provider={oauthRedirect} />;
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col">
        <div ref={formRef}>
          <AuthHeader />
          <div className="mt-8">
            <OAuthButtons onOAuth={handleOAuth} />
          </div>
        </div>

        {error && <AuthErrorBanner message={error} />}
      </div>
    </AuthLayout>
  );
};

export default AuthScreen;
