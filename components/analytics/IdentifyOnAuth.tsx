"use client";

import { useEffect, useRef } from "react";
import {
  trackAuthCompleted,
  trackSessionStarted,
} from "@/lib/analytics/events";
import { readFirstTouch } from "@/lib/analytics/first-touch";
import { initPostHog, posthog } from "@/lib/analytics/posthog-client";
import { getSessionUser } from "@/lib/auth/session";

/** Paste Supabase user UUID(s) here to tag internal/dev traffic in PostHog. */
const INTERNAL_USER_IDS = new Set<string>([
  "bfa88e70-0a53-46e8-93c1-8b7def1ae8a2",
  "fb851b57-9313-42e8-bd29-9fb49b4333e7",
  "4e9f72d5-91e4-4ac3-af87-aab317b4b866",
  "444bd8b5-af11-4989-8f9f-b5ba7bb4e4bd",
  "23b1569f-f63c-4048-a00c-9c2c41e27f09",
]);

const SESSION_FIRED_KEY = "mm_session_fired";

export function IdentifyOnAuth() {
  const identifyDone = useRef(false);

  useEffect(() => {
    initPostHog();

    let cancelled = false;
    void (async () => {
      const user = await getSessionUser();
      if (cancelled || !user) return;

      // Identify once per browser identity (new users only).
      if (!identifyDone.current && posthog?.get_distinct_id?.() !== user.id) {
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
      }
      identifyDone.current = true;

      // session_started: once per PostHog session, for new AND returning users
      const sid = posthog?.get_session_id?.();
      if (sid && sessionStorage.getItem(SESSION_FIRED_KEY) !== sid) {
        trackSessionStarted();
        try {
          sessionStorage.setItem(SESSION_FIRED_KEY, sid);
        } catch {
          // ignore
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
