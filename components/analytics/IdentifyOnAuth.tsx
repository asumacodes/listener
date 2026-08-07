"use client";

import { useEffect, useRef } from "react";
import { trackAuthCompleted } from "@/lib/analytics/events";
import { readFirstTouch } from "@/lib/analytics/first-touch";
import { initPostHog, posthog } from "@/lib/analytics/posthog-client";
import { getSessionUser } from "@/lib/auth/session";

/** Paste Supabase user UUID(s) here to tag internal/dev traffic in PostHog. */
const INTERNAL_USER_IDS = new Set<string>([]);

export function IdentifyOnAuth() {
  const done = useRef(false);

  useEffect(() => {
    initPostHog();
    if (done.current) return;

    let cancelled = false;
    void (async () => {
      const user = await getSessionUser();
      if (cancelled || !user) return; // anonymous or not-yet-settled: do nothing
      if (done.current) return;

      // Guard: only identify once per browser identity.
      // posthog.get_distinct_id() returns the anonymous id until we identify;
      // if it already equals user.id, we've identified this session already.
      if (posthog?.get_distinct_id?.() === user.id) {
        done.current = true;
        return;
      }

      const ft = readFirstTouch();
      posthog?.identify(user.id, undefined, {
        // Third arg = set-once in posthog-js: frozen at true first touch
        $initial_utm_source: ft?.utm_source,
        $initial_utm_medium: ft?.utm_medium,
        $initial_utm_campaign: ft?.utm_campaign,
        $initial_utm_content: ft?.utm_content,
        $initial_utm_term: ft?.utm_term,
        $initial_referrer: ft?.referrer,
        $initial_landing_path: ft?.landing_path,
      });

      if (INTERNAL_USER_IDS.has(user.id)) {
        posthog?.setPersonProperties({ is_internal: true });
      }

      trackAuthCompleted();
      done.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
