import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "recordings";

export interface RecordingAudio {
  recordingId: string;
  userId: string;
  audioBytes: Uint8Array;
  mimeType: string;
}

export class RecordingNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecordingNotFoundError";
  }
}

export class AudioDownloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioDownloadError";
  }
}

export async function fetchRecordingAudio(
  recordingId: string,
  supabase: SupabaseClient
): Promise<RecordingAudio> {
  const { data: rec, error: recErr } = await supabase
    .from("recordings")
    .select("id, user_id, audio_storage_path, audio_mime_type")
    .eq("id", recordingId)
    .single();

  if (recErr || !rec) {
    throw new RecordingNotFoundError(
      `Recording ${recordingId} not found or not accessible`
    );
  }

  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(rec.audio_storage_path);

  if (dlErr || !blob) {
    throw new AudioDownloadError(
      `Failed to download ${rec.audio_storage_path}: ${dlErr?.message ?? "no data"}`
    );
  }

  const audioBytes = new Uint8Array(await blob.arrayBuffer());

  return {
    recordingId: rec.id,
    userId: rec.user_id,
    audioBytes,
    mimeType: rec.audio_mime_type ?? "audio/webm",
  };
}
