import {
  deriveStateFromRun,
  type DerivedPipelineUi,
} from "@/lib/murmur/rehydrate";
import { toPipelineRunRow, toRunEventRow } from "@/lib/murmur/run-rows";
import type { RunEventRow } from "@/types/pipeline";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivePipelineResume = {
  runId: string;
  derived: DerivedPipelineUi;
};

/** Returns in-flight pipeline state for tab-refresh recovery, or null. */
export const resumeActivePipeline = async (
  recordingId: string,
  supabase: SupabaseClient
): Promise<ActivePipelineResume | null> => {
  const { data: recording, error: recordingErr } = await supabase
    .from("recordings")
    .select("latest_run_id")
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
  if (!parsedRun || parsedRun.status !== "running") return null;

  const parsedEvents = (events ?? [])
    .map((row) => toRunEventRow(row))
    .filter((row): row is RunEventRow => row !== null);

  return {
    runId,
    derived: deriveStateFromRun(parsedRun, parsedEvents),
  };
};
