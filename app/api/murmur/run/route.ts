import { NextRequest, NextResponse } from "next/server";
import { kickoff } from "@/lib/murmur/kickoff";
import { createRun } from "@/lib/murmur/runs";
import { fetchRecordingAudio } from "@/lib/murmur/storage";
import { createClient } from "@/lib/supabase/server";

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
    await supabase
      .from("pipeline_runs")
      .update({ status: "running" })
      .eq("id", run.runId);
    return NextResponse.json({ ok: true, runId: run.runId, status: "running" });
  }

  return NextResponse.json(
    { ok: false, runId: run.runId, reason: "handoff_failed", handoff: result },
    { status: 502 }
  );
}
