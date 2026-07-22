import { notFound } from "next/navigation";

import SentryClientDebugPage from "./SentryClientDebugPage";

/**
 * Preview/dev-only debug surface for Phase 1 Sentry verification.
 */
export default function DebugSentryPage() {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return <SentryClientDebugPage />;
}
