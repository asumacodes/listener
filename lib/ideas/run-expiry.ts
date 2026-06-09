// lib/ideas/run-expiry.ts
//
// Retention lifecycle per ADR-018: run_results retained 1 month (default tier)
// or 6 months (extended), driven by the real pipeline_runs.expires_at. On
// reaching expires_at a 7-day GRACE WINDOW begins — dashboard still fully
// available, with an amber banner — after which run_results is purged and the
// idea drops out of history (the expired screen takes over).

import type { IdeaRunSummary, RunRetention } from "@/types/ideas";

export const GRACE_WINDOW_DAYS = 7;
const GRACE_WINDOW_MS = GRACE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type RunDisplayStatus = IdeaRunSummary["status"] | "expired";

export type RetentionPhase = "active" | "grace" | "expired";

/**
 * Where the run sits in its retention lifecycle.
 * - active : before expires_at (or no expiry set) — normal dashboard
 * - grace  : past expires_at, within the 7-day grace window — banner shown
 * - expired: past the grace window — results purged, expired screen
 */
export const getRetentionPhase = (
  run: IdeaRunSummary | null,
  retention: RunRetention | null,
  nowMs: number = Date.now()
): RetentionPhase => {
  if (!run || run.status !== "done") return "active";
  if (!retention?.expiresAt) return "active";

  const expiresMs = new Date(retention.expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return "active";

  if (nowMs < expiresMs) return "active";
  if (nowMs < expiresMs + GRACE_WINDOW_MS) return "grace";
  return "expired";
};

export const isRunResultsExpired = (
  run: IdeaRunSummary | null,
  retention: RunRetention | null,
  nowMs: number = Date.now()
): boolean => getRetentionPhase(run, retention, nowMs) === "expired";

/** Whole days remaining in the grace window (>=0), for banner copy. */
export const graceDaysRemaining = (
  retention: RunRetention | null,
  nowMs: number = Date.now()
): number => {
  if (!retention?.expiresAt) return 0;
  const expiresMs = new Date(retention.expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return 0;
  const graceEnd = expiresMs + GRACE_WINDOW_MS;
  return Math.max(0, Math.ceil((graceEnd - nowMs) / DAY_MS));
};

export const getRunDisplayStatus = (
  run: IdeaRunSummary,
  retention: RunRetention | null,
  nowMs: number = Date.now()
): RunDisplayStatus => {
  if (isRunResultsExpired(run, retention, nowMs)) return "expired";
  return run.status;
};

export const runStatusBadge = (status: RunDisplayStatus) => {
  switch (status) {
    case "done":
      return { label: "Done", cls: "bg-gold-10 text-gold" };
    case "failed":
      return { label: "Failed", cls: "bg-error-surface text-red" };
    case "expired":
      return { label: "Expired", cls: "bg-black/[0.04] text-muted" };
    case "running":
    case "queued":
      return { label: "Running", cls: "bg-gold-10 text-gold" };
    default:
      return { label: status, cls: "bg-black/[0.04] text-muted" };
  }
};
