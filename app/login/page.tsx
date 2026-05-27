"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(errorParam);

  const supabase = createClient();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

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

    const { error } = await fn;
    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setMessage("Check your email for a confirmation link.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col justify-center px-6 py-12">
      <h1 className="font-serif text-4xl text-text-primary">Listener</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Speak. Transcribe. Ship.
      </p>

      <div className="mt-10 space-y-3">
        <button
          onClick={() => handleOAuth("google")}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-text-primary hover:bg-black/5"
        >
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("github")}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-text-primary hover:bg-black/5"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-black/10" />
        or
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gold-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {isLoading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 text-xs text-text-secondary underline"
      >
        {mode === "signin"
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </button>

      {message && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-error-bg px-3 py-2 text-xs text-recording-red">
          {error}
        </p>
      )}
    </main>
  );
};

export default LoginPage;
