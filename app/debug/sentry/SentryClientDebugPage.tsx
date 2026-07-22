"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

/**
 * Deliberate client error for Sentry verification (Phase 1 / Phase 6).
 * Available in development and Vercel Preview only — blank 404 shell in production
 * is handled by the server page wrapper.
 */
export default function SentryClientDebugPage() {
  const [armed, setArmed] = useState(false);

  if (armed) {
    throw new Error("Sentry client verify: deliberate client error");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Sentry client verify
      </h1>
      <p className="text-sm text-neutral-600">
        Triggers a deliberate client-side exception so we can confirm Sentry
        receives it with a readable stack trace on Preview.
      </p>
      <button
        type="button"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        onClick={() => {
          Sentry.captureException(
            new Error("Sentry client verify: captureException")
          );
          setArmed(true);
        }}
      >
        Throw client error
      </button>
    </main>
  );
}
