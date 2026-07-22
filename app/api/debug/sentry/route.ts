import { NextResponse } from "next/server";

/**
 * Deliberate server error for Sentry verification (Phase 1 / Phase 6).
 * Available in development and Vercel Preview only — 404 in production.
 */
export const GET = () => {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  throw new Error("Sentry API verify: deliberate server error");
};
