import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: runId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: run, error: readError } = await supabase
    .from("pipeline_runs")
    .select("id, recording_id, status")
    .eq("id", runId)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
  if (!run) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (run.status !== "done" && run.status !== "failed") {
    return NextResponse.json({ error: "run_not_terminal" }, { status: 409 });
  }

  const { error: deleteError, count } = await supabase
    .from("pipeline_runs")
    .delete({ count: "exact" })
    .eq("id", runId);

  if (deleteError) {
    return NextResponse.json({ error: "row_delete_failed" }, { status: 500 });
  }
  if (count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { error: pointerError } = await supabase
    .from("recordings")
    .update({ latest_run_id: null })
    .eq("id", run.recording_id)
    .eq("latest_run_id", runId);

  if (pointerError) {
    console.error("latest_run_id repair failed after run delete", {
      runId,
      recordingId: run.recording_id,
      error: pointerError.message,
    });
  }

  return NextResponse.json({ ok: true, deleted: runId });
}
