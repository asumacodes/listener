// app/api/murmur/resume/route.ts
//
// Resumes a FAILED pipeline run via HMAC v2 (ADR-032(f)). Mints a new run row
// linked by resumed_from_run_id, derives from_stage server-side from run_events,
// and hands off to the Bridge. Client sends only resume_run_id — never from_stage.

import { NextRequest, NextResponse } from "next/server";
import { ConcurrentRunError } from "@/lib/murmur/guards";
import { kickoffResume } from "@/lib/murmur/kickoff";
import { createRun } from "@/lib/murmur/runs";
import { fetchRecordingAudio } from "@/lib/murmur/storage";
import { createClient } from "@/lib/supabase/server";
import { getConnectionStatus } from "@/lib/integrations/atlassian/connection-store";
import { isPipelineStage } from "@/types/pipeline";

export async function POST(req: NextRequest) {
  const secret = process.env.MURMUR_HMAC_SECRET;
  const bridgeBaseUrl = process.env.BRIDGE_WEBHOOK_URL;
  if (!secret || !bridgeBaseUrl) {
    return NextResponse.json(
      { ok: false, reason: "server_misconfigured" },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    resume_run_id?: string;
  } | null;
  const resumeRunId = body?.resume_run_id;
  if (!resumeRunId) {
    return NextResponse.json(
      { ok: false, reason: "missing_resume_run_id" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, reason: "unauthenticated" },
      { status: 401 }
    );
  }

  const { data: prior, error: priorErr } = await supabase
    .from("pipeline_runs")
    .select("id, user_id, recording_id, current_stage, status")
    .eq("id", resumeRunId)
    .single();

  if (priorErr || !prior || prior.user_id !== user.id) {
    return NextResponse.json(
      { ok: false, reason: "run_not_found" },
      { status: 404 }
    );
  }

  // ADR-032(f) status guard — server-side backstop, un-bypassable.
  if (prior.status !== "failed") {
    return NextResponse.json(
      { ok: false, reason: "resume_not_allowed", status: prior.status },
      { status: 403 }
    );
  }

  const atlassian = await getConnectionStatus(user.id);
  if (!atlassian.connected) {
    return NextResponse.json(
      { ok: false, reason: "atlassian_required" },
      { status: 403 }
    );
  }

  const { data: events } = await supabase
    .from("run_events")
    .select("stage, event, created_at")
    .eq("run_id", resumeRunId)
    .order("created_at", { ascending: false });

  const failedEvt = (events ?? []).find((e) => e.event === "stage_failed");
  const fromStageRaw = failedEvt?.stage ?? prior.current_stage ?? null;
  const fromStage =
    typeof fromStageRaw === "string" && isPipelineStage(fromStageRaw)
      ? fromStageRaw
      : null;

  // No stage ever started → handoff/pre-stage failure; nothing to resume past.
  if (!fromStage) {
    return NextResponse.json(
      { ok: false, reason: "not_resumable" },
      { status: 422 }
    );
  }

  let audio;
  try {
    audio = await fetchRecordingAudio(prior.recording_id, supabase);
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        reason: "recording_unavailable",
        detail: String(e),
      },
      { status: 404 }
    );
  }

  let run;
  try {
    run = await createRun(
      {
        recordingId: prior.recording_id,
        userId: user.id,
        resumedFromRunId: resumeRunId,
      },
      supabase
    );
  } catch (e) {
    if (e instanceof ConcurrentRunError) {
      return NextResponse.json(
        { ok: false, reason: "run_in_progress", activeRunId: e.activeRunId },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, reason: "create_failed", detail: String(e) },
      { status: 500 }
    );
  }

  const result = await kickoffResume({
    runId: run.runId,
    audioBytes: audio.audioBytes,
    mimeType: audio.mimeType,
    secret,
    bridgeBaseUrl,
    fromStage,
    resumeRunId,
  });

  if (result.ok) {
    const { error: runningUpdateError } = await supabase
      .from("pipeline_runs")
      .update({ status: "running" })
      .eq("id", run.runId);
    if (runningUpdateError) {
      console.error("pipeline run status update failed after resume handoff", {
        runId: run.runId,
        status: "running",
        error: runningUpdateError.message,
      });
    }
    return NextResponse.json({
      ok: true,
      runId: run.runId,
      status: "running",
    });
  }

  const { error: failedUpdateError } = await supabase
    .from("pipeline_runs")
    .update({ status: "failed" })
    .eq("id", run.runId);
  if (failedUpdateError) {
    console.error(
      "pipeline run status update failed after resume handoff failure",
      {
        runId: run.runId,
        status: "failed",
        error: failedUpdateError.message,
      }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      runId: run.runId,
      reason: "handoff_failed",
      handoff: result,
    },
    { status: 502 }
  );
}
