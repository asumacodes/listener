"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import AuthLayout from "@/components/auth/AuthLayout";
import DesktopAuthScreen from "@/components/desktop/auth/DesktopAuthScreen";
import { useAuthActions, useAuthState, useIsDesktop } from "@/hooks";
import AuthScreen from "@/screens/AuthScreen";

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const authState = useAuthState({
    initialError: searchParams.get("error"),
  });
  const actions = useAuthActions(authState);
  const { isDesktop } = useIsDesktop();

  if (isDesktop) {
    return <DesktopAuthScreen authState={authState} actions={actions} />;
  }

  return <AuthScreen authState={authState} actions={actions} />;
};

const LoginFallback = () => (
  <AuthLayout centered>
    <Spinner label="Loading" />
  </AuthLayout>
);

const LoginPage = () => (
  <Suspense fallback={<LoginFallback />}>
    <LoginPageContent />
  </Suspense>
);

export default LoginPage;
