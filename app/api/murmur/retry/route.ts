// app/api/murmur/retry/route.ts
//
// Retries the handoff for an EXISTING pipeline_runs row (one that was created but
// whose POST to the Bridge failed — it sits at status 'queued'). Re-fetches audio,
// re-signs, re-POSTs against the SAME run_id. Never calls createRun.
//
// Guard: only status 'queued' is retryable. 'running'/'done'/'failed' are rejected
// so a retry can't spawn a duplicate Bridge execution against a live or finished run.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRecordingAudio } from "@/lib/murmur/storage";
import { kickoff } from "@/lib/murmur/kickoff";
import { getConnectionStatus } from "@/lib/integrations/atlassian/connection-store";

export async function POST(req: NextRequest) {
  const secret = process.env.MURMUR_HMAC_SECRET;
  const bridgeBaseUrl = process.env.BRIDGE_WEBHOOK_URL;
  if (!secret || !bridgeBaseUrl) {
    return NextResponse.json(
      { ok: false, reason: "server_misconfigured" },
      { status: 500 }
    );
  }

  const { runId } = await req.json().catch(() => ({ runId: null }));
  if (!runId) {
    return NextResponse.json(
      { ok: false, reason: "missing_run_id" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, reason: "unauthenticated" },
      { status: 401 }
    );
  }

  const { data: run, error: runErr } = await supabase
    .from("pipeline_runs")
    .select("id, status, recording_id, user_id")
    .eq("id", runId)
    .single();

  if (runErr || !run) {
    return NextResponse.json(
      { ok: false, reason: "run_not_found" },
      { status: 404 }
    );
  }
  if (run.user_id !== user.id) {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 }
    );
  }

  if (run.status !== "queued") {
    return NextResponse.json(
      { ok: false, runId, reason: "run_not_retryable", status: run.status },
      { status: 409 }
    );
  }

  const atlassian = await getConnectionStatus(user.id);
  if (!atlassian.connected) {
    return NextResponse.json(
      { ok: false, reason: "atlassian_required" },
      { status: 403 }
    );
  }

  let audio;
  try {
    audio = await fetchRecordingAudio(run.recording_id, supabase);
  } catch (e) {
    return NextResponse.json(
      { ok: false, runId, reason: "recording_unavailable", detail: String(e) },
      { status: 404 }
    );
  }

  const result = await kickoff({
    runId: run.id,
    audioBytes: audio.audioBytes,
    mimeType: audio.mimeType,
    secret,
    bridgeBaseUrl,
  });

  if (result.ok) {
    const { error: runningUpdateError } = await supabase
      .from("pipeline_runs")
      .update({ status: "running" })
      .eq("id", run.id);
    if (runningUpdateError) {
      console.error("pipeline run status update failed after handoff retry", {
        runId: run.id,
        status: "running",
        error: runningUpdateError.message,
      });
    }
    return NextResponse.json({ ok: true, runId: run.id, status: "running" });
  }

  const { error: failedUpdateError } = await supabase
    .from("pipeline_runs")
    .update({ status: "failed" })
    .eq("id", run.id);
  if (failedUpdateError) {
    console.error(
      "pipeline run status update failed after handoff retry failure",
      {
        runId: run.id,
        status: "failed",
        error: failedUpdateError.message,
      }
    );
  }

  return NextResponse.json(
    { ok: false, runId: run.id, reason: "handoff_failed", handoff: result },
    { status: 502 }
  );
}
