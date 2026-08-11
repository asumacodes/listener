"use client";

import {
  trackRecordingReviewed,
  trackCaptureAbandoned,
  type CaptureAbandonPhase,
} from "@/lib/analytics/events";
import { hasFired, markFired } from "@/lib/analytics/run-fired-guard";
import { useEffect, useRef } from "react";

type Args = {
  /** "review" (Playback) or "transcript" (Transcription). */
  phase: Extract<CaptureAbandonPhase, "review" | "transcript">;
  /** savedRecordingId on Transcription; undefined (pre-save) on Playback. */
  recordingId?: string;
};

/**
 * KAN-68 mobile review-screen analytics. Mirrors the desktop useCaptureModal
 * transition-fire: recording_reviewed on mount, capture_abandoned on
 * leave-without-kickoff (re-record OR navigate-away via pagehide).
 *
 * Returns markKickedOff — call it right before a kickoff so the leave handler
 * stays silent on the success path, and markAbandoned — call it from the
 * re-record button so the explicit path fires abandon and suppresses the
 * pagehide duplicate.
 */
export function useCaptureReviewAnalytics({ phase, recordingId }: Args) {
  // Guard id mirrors desktop: Transcription uses recordingId, Playback pre_save.
  const guardId = recordingId ?? "pre_save";
  const kickedOffRef = useRef(false);
  const abandonHandledRef = useRef(false);

  // recording_reviewed on mount (guarded — remounts on blocked-kickoff bounce).
  useEffect(() => {
    if (!hasFired("recording_reviewed", guardId)) {
      trackRecordingReviewed("mobile", recordingId);
      markFired("recording_reviewed", guardId);
    }
  }, [guardId, recordingId]);

  const fireAbandon = () => {
    if (kickedOffRef.current || abandonHandledRef.current) return;
    // Abandon is once-per-review-session; key off the same guardId namespace.
    const abandonKind = `capture_abandoned:${phase}`;
    if (hasFired(abandonKind, guardId)) return;
    abandonHandledRef.current = true;
    trackCaptureAbandoned(phase, "mobile", recordingId);
    markFired(abandonKind, guardId);
  };

  // Navigate-away: pagehide is the most reliable mobile-Safari leave signal
  // (same mechanism PostHog's capture_pageleave already relies on here).
  // visibilitychange→hidden covers tab-switch/app-background as a backstop.
  useEffect(() => {
    const onPageHide = () => fireAbandon();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") fireAbandon();
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // fireAbandon reads refs only; deps intentionally empty for stable listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardId, phase, recordingId]);

  return {
    /** Call immediately before a kickoff so leave stays silent on success. */
    markKickedOff: () => {
      kickedOffRef.current = true;
    },
    /** Call from the re-record/start-over button (explicit abandon). */
    markAbandoned: fireAbandon,
  };
}

export default useCaptureReviewAnalytics;
