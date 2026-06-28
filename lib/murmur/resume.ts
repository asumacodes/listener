import {
  deriveStateFromRun,
  type DerivedPipelineUi,
} from "@/lib/murmur/rehydrate";
import { toPipelineRunRow, toRunEventRow } from "@/lib/murmur/run-rows";
import type { RunEventRow } from "@/types/pipeline";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivePipelineResume = {
  runId: string;
  recordingId: string | null;
  recording: {
    transcription: string;
    language: string | null;
    durationSeconds: number;
    recordedAt: string;
  };
  derived: DerivedPipelineUi;
};

const toResumeRecording = (
  recording: Record<string, unknown> | null | undefined
): ActivePipelineResume["recording"] => ({
  transcription:
    typeof recording?.transcription === "string" ? recording.transcription : "",
  language: typeof recording?.language === "string" ? recording.language : null,
  durationSeconds:
    typeof recording?.duration_seconds === "number"
      ? recording.duration_seconds
      : 0,
  recordedAt:
    typeof recording?.created_at === "string"
      ? recording.created_at
      : new Date().toISOString(),
});

/** Returns in-flight pipeline state for tab-refresh recovery, or null. */
export const resumeActivePipeline = async (
  recordingId: string,
  supabase: SupabaseClient
): Promise<ActivePipelineResume | null> => {
  const { data: recording, error: recordingErr } = await supabase
    .from("recordings")
    .select(
      "latest_run_id, transcription, language, duration_seconds, created_at"
    )
    .eq("id", recordingId)
    .single();

  if (recordingErr || !recording?.latest_run_id) return null;

  const runId = recording.latest_run_id;

  const [{ data: run }, { data: events }] = await Promise.all([
    supabase
      .from("pipeline_runs")
      .select("id, status, current_stage")
      .eq("id", runId)
      .single(),
    supabase
      .from("run_events")
      .select("run_id, stage, event, detail, created_at")
      .eq("run_id", runId)
      .order("created_at", { ascending: true }),
  ]);

  const parsedRun = toPipelineRunRow(run);
  if (
    !parsedRun ||
    (parsedRun.status !== "queued" && parsedRun.status !== "running")
  ) {
    return null;
  }

  const parsedEvents = (events ?? [])
    .map((row) => toRunEventRow(row))
    .filter((row): row is RunEventRow => row !== null);

  return {
    runId,
    recordingId,
    recording: toResumeRecording(recording),
    derived: deriveStateFromRun(parsedRun, parsedEvents),
  };
};

/**
 * Fresh-app-open recovery. If sessionStorage is gone, find the current user's
 * newest active run directly from pipeline_runs and rebuild the live surface.
 */
export const resumeActiveRunForUser = async (
  supabase: SupabaseClient
): Promise<ActivePipelineResume | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: run } = await supabase
    .from("pipeline_runs")
    .select("id, recording_id, status, current_stage, created_at")
    .eq("user_id", user.id)
    .in("status", ["queued", "running"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const parsedRun = toPipelineRunRow(run);
  if (
    !parsedRun ||
    (parsedRun.status !== "queued" && parsedRun.status !== "running")
  ) {
    return null;
  }

  const runRecord = run as Record<string, unknown>;
  const recordingId =
    typeof runRecord.recording_id === "string" ? runRecord.recording_id : null;
  if (!recordingId) return null;

  const [{ data: recording }, { data: events }] = await Promise.all([
    supabase
      .from("recordings")
      .select("transcription, language, duration_seconds, created_at")
      .eq("id", recordingId)
      .maybeSingle(),
    supabase
      .from("run_events")
      .select("run_id, stage, event, detail, created_at")
      .eq("run_id", parsedRun.id)
      .order("created_at", { ascending: true }),
  ]);

  const parsedEvents = (events ?? [])
    .map((row) => toRunEventRow(row))
    .filter((row): row is RunEventRow => row !== null);

  return {
    runId: parsedRun.id,
    recordingId,
    recording: toResumeRecording(recording),
    derived: deriveStateFromRun(parsedRun, parsedEvents),
  };
};
