"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthBrand from "@/components/auth/AuthBrand";
import CheckEmailCard from "@/components/auth/CheckEmailCard";
import { GitHubIcon, GoogleIcon } from "@/components/auth/ProviderIcons";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";
type OAuthProvider = "google" | "github";

const inputClassName =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-primary/30";

const oauthButtonClassName =
  "flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-black/[0.03] disabled:opacity-50";

const LoginPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [oauthRedirect, setOauthRedirect] = useState<OAuthProvider | null>(
    null
  );
  const [emailBanner, setEmailBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(errorParam);

  const supabase = createClient();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setEmailBanner(null);
    setShowCheckEmail(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailBanner(null);

    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

    const { error: authError } = await fn;
    setIsLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup") {
      setShowCheckEmail(true);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setError(null);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setIsResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setEmailBanner(`Check your email — sent to ${email}`);
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setEmailBanner(null);
    setOauthRedirect(provider);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setOauthRedirect(null);
      setError(oauthError.message);
    }
  };

  if (oauthRedirect) {
    const label =
      oauthRedirect === "google"
        ? "Redirecting to Google…"
        : "Redirecting to GitHub…";

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center px-6 py-12">
        <AuthBrand />
        <div className="mt-16 flex flex-col items-center gap-4">
          <LoadingSpinner className="h-10 w-10 border-2" />
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col px-6 py-12">
      <AuthBrand />

      <div className="mt-10 flex flex-1 flex-col">
        {showCheckEmail ? (
          <CheckEmailCard
            email={email}
            isResending={isResending}
            onResend={handleResend}
            onBack={() => {
              setShowCheckEmail(false);
              setEmailBanner(null);
              switchMode("signin");
            }}
          />
        ) : (
          <>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className={oauthButtonClassName}
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("github")}
                className={oauthButtonClassName}
              >
                <GitHubIcon />
                Continue with GitHub
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-text-muted">
              <span className="h-px flex-1 bg-black/10" />
              or
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-medium tracking-[0.15em] text-text-muted uppercase"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] font-medium tracking-[0.15em] text-text-muted uppercase"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassName}
                />
                {mode === "signup" && (
                  <p className="text-xs text-text-muted">
                    At least 8 characters
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gold-primary px-4 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50"
              >
                {isLoading
                  ? "…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-text-secondary">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-text-primary underline underline-offset-2"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-medium text-text-primary underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
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

        {error && (
          <p
            className="mt-4 rounded-xl bg-error-bg px-3 py-2 text-xs text-recording-red"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
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
