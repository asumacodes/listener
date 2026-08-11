import { posthog } from "./posthog-client";
import type { M1CardId } from "@/types/ideas";

export type AnalyticsSurface = "mobile" | "desktop";
export type ConnectContext = "settings" | "pre_run";

export function trackAuthStarted(provider: "google" | "github" | "phone") {
  posthog?.capture("auth_started", { provider });
}

export function trackAuthCompleted(provider?: string) {
  posthog?.capture("auth_completed", provider ? { provider } : undefined);
}

export function trackSessionStarted() {
  posthog?.capture("session_started");
}

export function trackAtlassianConnected(context: ConnectContext) {
  posthog?.capture("atlassian_connected", { connect_context: context });
}

export function trackRecordingStarted(surface: AnalyticsSurface) {
  posthog?.capture("recording_started", { surface });
}

export function trackRecordingCompleted(
  recordingId: string,
  surface: AnalyticsSurface
) {
  posthog?.capture("recording_completed", {
    recording_id: recordingId,
    surface,
  });
}

export function trackRunKickedOff(
  runId: string,
  recordingId: string,
  surface: AnalyticsSurface,
  isResume: boolean
) {
  posthog?.capture("run_kicked_off", {
    run_id: runId,
    recording_id: recordingId,
    surface,
    is_resume: isResume,
  });
}

export function trackRunCompleted(
  runId: string,
  recordingId: string,
  surface: AnalyticsSurface
) {
  posthog?.capture("run_completed", {
    run_id: runId,
    recording_id: recordingId,
    surface,
  });
}

export function trackRunViewed(
  runId: string,
  recordingId: string,
  surface: AnalyticsSurface
) {
  posthog?.capture("run_viewed", {
    run_id: runId,
    recording_id: recordingId,
    surface,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// KAN-68 — Behavioral / interaction events (interaction taxonomy).
// Rides the same PostHog instance as KAN-59's funnel (ADR-042). Route/action-
// based, no element selectors, no PII. `surface` on every event so drop-off
// reads per-surface. `recording_id`/`run_id` reuse KAN-48's keys for analytical
// joins to cost rows — distinct systems, shared vocabulary.
// ─────────────────────────────────────────────────────────────────────────────

/** Why a kickoff attempt did not start a run (the four non-ok exits + the
 *  desktop pre-API canKickoff===false quota wall, mapped to out_of_quota). */
export type RunBlockedReason =
  | "out_of_quota"
  | "run_in_progress"
  | "cost_halt"
  | "atlassian_required";

/** Which caller hit the block — separates a first-attempt block from a
 *  re-run / resume block for the same person. */
export type RunBlockedContext = "initial" | "rerun" | "resume";

/** Where in the pre-kickoff flow the user left without starting a run. */
export type CaptureAbandonPhase =
  | "launcher_empty" // opened launcher, closed before recording/typing
  | "review" // had a take, didn't run
  | "transcript" // transcribed, didn't run
  | "atlassian_precheck"; // mobile: dismissed Atlassian sheet before kickoff

export type PaneActionKind = "download" | "copy" | "download_all";

/** Rail / tab destinations. Record is excluded — it opens the launcher, not a
 *  route (fires launcher_opened instead). */
export type NavDest = "projects" | "search" | "account";

// ── A. Pre-kickoff funnel — stranger drop-off layer (P0) ──────────────────────

/** Desktop capture launcher opened. Fires raw (an open is an open); dedup is
 *  not wanted — re-opens are real funnel entries. Mobile has no launcher modal;
 *  its top-of-funnel is the existing recording_started. */
export function trackLauncherOpened() {
  posthog?.capture("launcher_opened", { surface: "desktop" });
}

/** User left the capture flow without kicking off a run. `recordingId` is
 *  absent for phase "launcher_empty" (nothing saved yet) — honest, funnel keys
 *  on person+surface for that step. Guard atlassian_precheck with hasFired. */
export function trackCaptureAbandoned(
  phase: CaptureAbandonPhase,
  surface: AnalyticsSurface,
  recordingId?: string
) {
  posthog?.capture("capture_abandoned", {
    phase,
    surface,
    ...(recordingId ? { recording_id: recordingId } : {}),
  });
}

/** Take finished / transcript shown — the hesitation point before Run.
 *  hasFired-guarded on recordingId (or "pre_save") by the caller. */
export function trackRecordingReviewed(
  surface: AnalyticsSurface,
  recordingId?: string
) {
  posthog?.capture("recording_reviewed", {
    surface,
    ...(recordingId ? { recording_id: recordingId } : {}),
  });
}

/** Typed-idea path entered (desktop; mobile typed is KAN-81). */
export function trackCaptureTypedStarted(surface: AnalyticsSurface) {
  posthog?.capture("capture_typed_started", { surface });
}

// ── B. Blocked-at-kickoff — one shared helper, 4 call sites (P0) ──────────────

/** A kickoff attempt returned a non-ok reason (or hit the desktop pre-API
 *  canKickoff quota wall). Fires raw — naturally once per user action.
 *  recordingId present whenever an idea is in context; runId only on
 *  resume/re-run paths where a prior run exists. */
export function trackRunBlocked(
  reason: RunBlockedReason,
  context: RunBlockedContext,
  surface: AnalyticsSurface,
  ids?: { recordingId?: string; runId?: string }
) {
  posthog?.capture("run_blocked", {
    reason,
    context,
    surface,
    ...(ids?.recordingId ? { recording_id: ids.recordingId } : {}),
    ...(ids?.runId ? { run_id: ids.runId } : {}),
  });
}

// ── C. Secondary engagement (P1) ──────────────────────────────────────────────

/** Artifact pane selected. hasFired-guarded on `${runId}:${pane}` by the caller
 *  (fires once per pane per run). runId absent only if selection somehow
 *  precedes a run id being known. */
export function trackPaneViewed(
  pane: M1CardId,
  surface: AnalyticsSurface,
  runId?: string
) {
  posthog?.capture("pane_viewed", {
    pane,
    surface,
    ...(runId ? { run_id: runId } : {}),
  });
}

/** Download / copy / download-all after a successful handler path.
 *  `pane` omitted for header download_all (not a single artifact). */
export function trackPaneAction(
  action: PaneActionKind,
  surface: AnalyticsSurface,
  opts?: { pane?: M1CardId; runId?: string }
) {
  posthog?.capture("pane_action", {
    action,
    surface,
    ...(opts?.pane ? { pane: opts.pane } : {}),
    ...(opts?.runId ? { run_id: opts.runId } : {}),
  });
}

/** Rail (desktop) / tab (mobile) destination entered. Record is excluded. */
export function trackNavViewed(
  dest: NavDest,
  surface: AnalyticsSurface,
  runId?: string
) {
  posthog?.capture("nav_viewed", {
    dest,
    surface,
    ...(runId ? { run_id: runId } : {}),
  });
}
