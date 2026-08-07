import { fetchRunResults } from "@/lib/murmur/client";
import { clearLatestRunLink } from "@/lib/murmur/runs";
import { toPipelineRunRow, toRunEventRow } from "@/lib/murmur/run-rows";
import { deriveStateFromRun } from "@/lib/murmur/rehydrate";
import { createClient } from "@/lib/supabase/client";
import type { PipelineRunRow, RunEventRow } from "@/types/pipeline";
import type { RunResults } from "@/types/run-results";

export type LiveRunSnapshot = {
  run: PipelineRunRow;
  events: RunEventRow[];
  results: RunResults | null;
};

export const readLiveRunSnapshot = async (
  runId: string
): Promise<LiveRunSnapshot | null> => {
  const supabase = createClient();
  const [{ data: run }, { data: events }, results] = await Promise.all([
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
    fetchRunResults(runId),
  ]);

  const parsedRun = toPipelineRunRow(run);
  if (!parsedRun) return null;

  return {
    run: parsedRun,
    events: (events ?? [])
      .map((row) => toRunEventRow(row))
      .filter((row): row is RunEventRow => row !== null),
    results,
  };
};

export type LiveRunStatusUpdate = Pick<
  PipelineRunRow,
  "status" | "current_stage"
>;

export const subscribeToLiveRun = (
  runId: string,
  callbacks: {
    onEvent: (event: RunEventRow) => void;
    onStatus: (run: LiveRunStatusUpdate) => void;
  }
): (() => void) => {
  const supabase = createClient();
  const channel = supabase
    .channel(`murmur-run-${runId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "run_events",
        filter: `run_id=eq.${runId}`,
      },
      (payload) => {
        const event = toRunEventRow(payload.new);
        if (event) callbacks.onEvent(event);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "pipeline_runs",
        filter: `id=eq.${runId}`,
      },
      (payload) => {
        const run = toPipelineRunRow(payload.new);
        if (run) {
          callbacks.onStatus({
            status: run.status,
            current_stage: run.current_stage,
          });
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};

export const clearClientLatestRunLink = async (
  recordingId: string
): Promise<void> => {
  const supabase = createClient();
  await clearLatestRunLink(recordingId, supabase);
};

/** Resolve pipeline error detail from a live snapshot (failed-pane copy). */
export const fetchRunPipelineError = async (
  runId: string
): Promise<string | null> => {
  const snapshot = await readLiveRunSnapshot(runId);
  if (!snapshot) return null;
  return deriveStateFromRun(snapshot.run, snapshot.events).pipelineError;
};
