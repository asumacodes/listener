import { posthog } from "./posthog-client";

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
