// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://43e9459132d421046fcb80778b54a584@o4511778488975360.ingest.us.sentry.io/4511778489630720",

  environment: process.env.VERCEL_ENV ?? "development",
  tracesSampleRate: 0.1,
});
