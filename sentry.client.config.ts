// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://43e9459132d421046fcb80778b54a584@o4511778488975360.ingest.us.sentry.io/4511778489630720",

  environment: process.env.VERCEL_ENV ?? "development",
  tracesSampleRate: 0.1,

  ignoreErrors: [
    "AbortError",
    "Non-Error promise rejection captured",
    "ResizeObserver loop limit exceeded",
    "Network request failed",
    "Failed to fetch",
    "Load failed",
  ],
  beforeSend(event, hint) {
    // Drop errors from a closed/backgrounded tab mid-recording or mid-run
    if (
      hint.originalException instanceof DOMException &&
      hint.originalException.name === "AbortError"
    ) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
