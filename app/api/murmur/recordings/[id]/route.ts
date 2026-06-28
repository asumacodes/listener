import { deleteRecordingAudio } from "@/lib/ideas/delete-storage";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: recordingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: recording, error: readError } = await supabase
    .from("recordings")
    .select("id, audio_storage_path")
    .eq("id", recordingId)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
  if (!recording) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const storage = await deleteRecordingAudio(
    supabase,
    recording.audio_storage_path
  );
  if (storage.failed) {
    return NextResponse.json(
      { error: "storage_delete_failed" },
      { status: 502 }
    );
  }

  const { error: deleteError, count } = await supabase
    .from("recordings")
    .delete({ count: "exact" })
    .eq("id", recordingId);

  if (deleteError) {
    return NextResponse.json({ error: "row_delete_failed" }, { status: 500 });
  }
  if (count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: recordingId });
}
