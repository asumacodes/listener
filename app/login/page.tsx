"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthActions, useAuthState } from "@/hooks";
import LoginScreen from "@/screens/LoginScreen";

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const authState = useAuthState({
    initialError: searchParams.get("error"),
  });
  const actions = useAuthActions(authState);

  return <LoginScreen authState={authState} actions={actions} />;
};

const LoginFallback = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-[390px] items-center justify-center px-6">
    <LoadingSpinner className="h-10 w-10 border-2" />
  </main>
);

const LoginPage = () => (
  <Suspense fallback={<LoginFallback />}>
    <LoginPageContent />
  </Suspense>
);

export default LoginPage;
