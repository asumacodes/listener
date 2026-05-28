import AuthBrand from "@/components/auth/AuthBrand";
import CheckEmailCard from "@/components/auth/CheckEmailCard";
import { GitHubIcon, GoogleIcon } from "@/components/auth/ProviderIcons";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { AuthActions, AuthState } from "@/types/auth";
import { OAuthProvider } from "@/types";

const inputClassName =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-primary/30";

const oauthButtonClassName =
  "flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-black/[0.03] disabled:opacity-50";

const oauthRedirectLabel: Record<OAuthProvider, string> = {
  google: "Redirecting to Google…",
  github: "Redirecting to GitHub…",
};

type LoginScreenProps = {
  authState: AuthState;
  actions: AuthActions;
};

const LoginScreen = ({ authState, actions }: LoginScreenProps) => {
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

  if (oauthRedirect) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center px-6 py-12">
        <AuthBrand />
        <div className="mt-16 flex flex-col items-center gap-4">
          <LoadingSpinner className="h-10 w-10 border-2" />
          <p className="text-sm text-text-secondary">
            {oauthRedirectLabel[oauthRedirect]}
          </p>
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
            onBack={backFromCheckEmail}
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
                  className="text-[11px] font-medium tracking-[0.15em] text-text-muted uppercase"
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
                  className="text-[11px] font-medium tracking-[0.15em] text-text-muted uppercase"
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

export default LoginScreen;
