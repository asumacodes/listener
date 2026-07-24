"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthSpinner from "@/components/auth/AuthSpinner";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuthActions, useAuthState } from "@/hooks";
import AuthScreen from "@/screens/AuthScreen";

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const authState = useAuthState({
    initialError: searchParams.get("error"),
  });
  const actions = useAuthActions(authState);

  return <AuthScreen authState={authState} actions={actions} />;
};

const LoginFallback = () => (
  <AuthLayout centered>
    <AuthSpinner />
  </AuthLayout>
);

const LoginPage = () => (
  <Suspense fallback={<LoginFallback />}>
    <LoginPageContent />
  </Suspense>
);

export default LoginPage;
