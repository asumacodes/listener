import type { SupabaseClient } from "@supabase/supabase-js";

export class RunCreateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunCreateError";
  }
}

export interface CreatedRun {
  runId: string;
  recordingId: string;
  userId: string;
}

export async function createRun(
  params: { recordingId: string; userId: string },
  supabase: SupabaseClient
): Promise<CreatedRun> {
  const { recordingId, userId } = params;

  const { data: run, error: insErr } = await supabase
    .from("pipeline_runs")
    .insert({
      recording_id: recordingId,
      user_id: userId,
      status: "queued",
    })
    .select("id")
    .single();

  if (insErr || !run) {
    throw new RunCreateError(
      `Could not create pipeline_runs row: ${insErr?.message ?? "no row returned"}`
    );
  }

  const { error: linkErr } = await supabase
    .from("recordings")
    .update({ latest_run_id: run.id })
    .eq("id", recordingId);

  if (linkErr) {
    console.warn(
      `latest_run_id link failed for recording ${recordingId} -> run ${run.id}: ${linkErr.message}`
    );
  }

  return { runId: run.id, recordingId, userId };
}
