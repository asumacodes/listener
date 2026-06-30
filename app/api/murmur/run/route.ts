import { NextRequest, NextResponse } from "next/server";
import { kickoff } from "@/lib/murmur/kickoff";
import { createRun } from "@/lib/murmur/runs";
import { fetchRecordingAudio } from "@/lib/murmur/storage";
import { createClient } from "@/lib/supabase/server";
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

  const body = (await req.json().catch(() => null)) as {
    recordingId?: string;
  } | null;
  const recordingId = body?.recordingId;
  if (!recordingId) {
    return NextResponse.json(
      { ok: false, reason: "missing_recording_id" },
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

  let audio;
  try {
    audio = await fetchRecordingAudio(recordingId, supabase);
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "recording_unavailable", detail: String(e) },
      { status: 404 }
    );
  }

  if (audio.userId !== user.id) {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 }
    );
  }

  // Pre-run hard gate (model B - Atlassian mandatory). The deliverable IS the
  // Jira board + Confluence space, so a run cannot start without a connection.
  // Enforced server-side: a direct API call cannot bypass this.
  const atlassian = await getConnectionStatus(user.id);
  if (!atlassian.connected) {
    return NextResponse.json(
      { ok: false, reason: "atlassian_required" },
      { status: 403 }
    );
  }

  let run;
  try {
    run = await createRun({ recordingId, userId: audio.userId }, supabase);
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "create_failed", detail: String(e) },
      { status: 500 }
    );
  }

  const result = await kickoff({
    runId: run.runId,
    audioBytes: audio.audioBytes,
    mimeType: audio.mimeType,
    secret,
    bridgeBaseUrl,
  });

  if (result.ok) {
    const { error: runningUpdateError } = await supabase
      .from("pipeline_runs")
      .update({ status: "running" })
      .eq("id", run.runId);
    if (runningUpdateError) {
      console.error("pipeline run status update failed after handoff", {
        runId: run.runId,
        status: "running",
        error: runningUpdateError.message,
      });
    }
    return NextResponse.json({ ok: true, runId: run.runId, status: "running" });
  }

  const { error: failedUpdateError } = await supabase
    .from("pipeline_runs")
    .update({ status: "failed" })
    .eq("id", run.runId);
  if (failedUpdateError) {
    console.error("pipeline run status update failed after handoff failure", {
      runId: run.runId,
      status: "failed",
      error: failedUpdateError.message,
    });
  }

  return NextResponse.json(
    { ok: false, runId: run.runId, reason: "handoff_failed", handoff: result },
    { status: 502 }
  );
}
