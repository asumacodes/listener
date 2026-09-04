import { parseBalances } from "@/lib/billing/parseBalances";
import type { KickoffResult } from "@/lib/murmur/kickoff";
import type { EffectiveBalance } from "@/types/billing";
import type { HandoffReason } from "@/types/pipeline";
import type { RunResults } from "@/types/run-results";

export type PipelineRunSuccess = {
  ok: true;
  runId: string;
  status: "running";
};

export type PipelineRunHandoffFailed = {
  ok: false;
  runId: string;
  reason: "handoff_failed";
  handoff: KickoffResult & { ok: false };
};

export type PipelineRunCreateFailed = {
  ok: false;
  reason:
    | "create_failed"
    | "recording_unavailable"
    | "unauthenticated"
    | "forbidden"
    | "missing_recording_id"
    | "server_misconfigured"
    | "atlassian_required"
    | "run_in_progress"
    | "out_of_quota"
    | "cost_halt"
    | "balance_check_failed"
    | "cost_halt_check_failed";
  detail?: string;
  activeRunId?: string;
  balances?: EffectiveBalance | null;
};

export type PipelineResumeFailed = {
  ok: false;
  reason:
    | "missing_resume_run_id"
    | "run_not_found"
    | "resume_not_allowed"
    | "not_resumable"
    | "recording_unavailable"
    | "unauthenticated"
    | "forbidden"
    | "server_misconfigured"
    | "atlassian_required"
    | "create_failed"
    | "run_in_progress";
  detail?: string;
  activeRunId?: string;
};

export type PipelineRunResponse =
  | PipelineRunSuccess
  | PipelineRunHandoffFailed
  | PipelineRunCreateFailed;

export type PipelineResumeResponse =
  | PipelineRunSuccess
  | PipelineRunHandoffFailed
  | PipelineResumeFailed;

export type PipelineRetryMissingRun = {
  ok: false;
  reason:
    | "missing_run_id"
    | "run_not_found"
    | "run_not_retryable"
    | "unauthenticated"
    | "forbidden"
    | "recording_unavailable"
    | "server_misconfigured"
    | "atlassian_required";
  detail?: string;
};

export type PipelineRetryResponse =
  | PipelineRunSuccess
  | PipelineRunHandoffFailed
  | PipelineRetryMissingRun;

const parseJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const startPipelineRun = async (
  recordingId: string
): Promise<PipelineRunResponse> => {
  let res: Response;
  try {
    res = await fetch("/api/murmur/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordingId }),
    });
  } catch (e) {
    return {
      ok: false,
      reason: "create_failed",
      detail: String(e),
    };
  }

  const body = (await parseJson(res)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "create_failed", detail: "Invalid response" };
  }

  if (body.ok === true && typeof body.runId === "string") {
    return { ok: true, runId: body.runId, status: "running" };
  }

  if (
    body.ok === false &&
    body.reason === "handoff_failed" &&
    typeof body.runId === "string" &&
    body.handoff &&
    typeof body.handoff === "object"
  ) {
    const handoff = body.handoff as KickoffResult;
    if (!handoff.ok) {
      return {
        ok: false,
        runId: body.runId,
        reason: "handoff_failed",
        handoff,
      };
    }
  }

  const reason =
    typeof body.reason === "string" ? body.reason : "create_failed";
  return {
    ok: false,
    reason: reason as PipelineRunCreateFailed["reason"],
    detail: typeof body.detail === "string" ? body.detail : undefined,
    activeRunId:
      typeof body.activeRunId === "string" ? body.activeRunId : undefined,
    balances: parseBalances(body.balances),
  };
};

export const resumePipelineRun = async (
  resumeRunId: string
): Promise<PipelineResumeResponse> => {
  let res: Response;
  try {
    res = await fetch("/api/murmur/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_run_id: resumeRunId }),
    });
  } catch (e) {
    return {
      ok: false,
      reason: "create_failed",
      detail: String(e),
    };
  }

  const body = (await parseJson(res)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "create_failed", detail: "Invalid response" };
  }

  if (body.ok === true && typeof body.runId === "string") {
    return { ok: true, runId: body.runId, status: "running" };
  }

  if (
    body.ok === false &&
    body.reason === "handoff_failed" &&
    typeof body.runId === "string" &&
    body.handoff &&
    typeof body.handoff === "object"
  ) {
    const handoff = body.handoff as KickoffResult;
    if (!handoff.ok) {
      return {
        ok: false,
        runId: body.runId,
        reason: "handoff_failed",
        handoff,
      };
    }
  }

  const reason =
    typeof body.reason === "string" ? body.reason : "create_failed";
  return {
    ok: false,
    reason: reason as PipelineResumeFailed["reason"],
    detail: typeof body.detail === "string" ? body.detail : undefined,
    activeRunId:
      typeof body.activeRunId === "string" ? body.activeRunId : undefined,
  };
};

export const retryPipelineRun = async (
  runId: string
): Promise<PipelineRetryResponse> => {
  let res: Response;
  try {
    res = await fetch("/api/murmur/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    });
  } catch (e) {
    return {
      ok: false,
      reason: "run_not_found",
      detail: String(e),
    };
  }

  const body = (await parseJson(res)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "run_not_found", detail: "Invalid response" };
  }

  if (body.ok === true && typeof body.runId === "string") {
    return { ok: true, runId: body.runId, status: "running" };
  }

  if (
    body.ok === false &&
    body.reason === "handoff_failed" &&
    typeof body.runId === "string" &&
    body.handoff &&
    typeof body.handoff === "object"
  ) {
    const handoff = body.handoff as KickoffResult;
    if (!handoff.ok) {
      return {
        ok: false,
        runId: body.runId,
        reason: "handoff_failed",
        handoff,
      };
    }
  }

  const reason =
    typeof body.reason === "string" ? body.reason : "run_not_found";
  return {
    ok: false,
    reason: reason as PipelineRetryMissingRun["reason"],
    detail: typeof body.detail === "string" ? body.detail : undefined,
  };
};

export const isHandoffReason = (value: unknown): value is HandoffReason =>
  value === "invalid_signature" ||
  value === "minutes_exhausted" ||
  value === "bad_response" ||
  value === "unreachable" ||
  value === "create_failed" ||
  value === "atlassian_required" ||
  value === "run_in_progress" ||
  value === "out_of_quota" ||
  value === "cost_halt";

export const fetchRunResults = async (
  runId: string
): Promise<RunResults | null> => {
  let res: Response;
  try {
    res = await fetch(`/api/runs/${runId}/results`);
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const body = (await parseJson(res)) as { data?: unknown } | null;
  if (!body || !("data" in body)) return null;
  return (body.data as RunResults | null) ?? null;
};
