import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key) return;

  posthog.init(key, {
    api_host: host,
    cross_subdomain_cookie: true, // MUST match www — same .trymurmur.studio cookie
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false, // app is route-milestone instrumented, not blanket pageview
    capture_pageleave: true,
    disable_session_recording: true,
    disable_surveys: true,
  });
  initialized = true;
}

export { posthog };
