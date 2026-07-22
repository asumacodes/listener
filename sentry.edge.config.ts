// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://43e9459132d421046fcb80778b54a584@o4511778488975360.ingest.us.sentry.io/4511778489630720",

  environment: process.env.VERCEL_ENV ?? "development",
  tracesSampleRate: 0.1,
});
