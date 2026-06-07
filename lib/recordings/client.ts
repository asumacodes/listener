import { RecordingSaveError } from "@/lib/errors";
import { mimeToExtension } from "@/lib/media/recorder";
import { createClient } from "@/lib/supabase/client";
import { autoTitle } from "@/lib/title";
import type { SaveRecordingArgs, SaveRecordingResult } from "@/types/recording";

export const saveRecording = async (
  args: SaveRecordingArgs
): Promise<SaveRecordingResult> => {
  const supabase = createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new RecordingSaveError("Not authenticated", "NOT_AUTHENTICATED");
  }

  const { data: defaultProject, error: projectErr } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();
  if (projectErr || !defaultProject) {
    throw new RecordingSaveError(
      "Default project missing",
      "DEFAULT_PROJECT_MISSING"
    );
  }

  const recordingId = crypto.randomUUID();
  const ext = mimeToExtension(args.mimeType);
  const storagePath = `${user.id}/${recordingId}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("recordings")
    .upload(storagePath, args.blob, {
      contentType: args.mimeType,
      upsert: false,
    });
  if (uploadErr) {
    throw new RecordingSaveError(
      `Storage upload failed: ${uploadErr.message}`,
      "STORAGE_UPLOAD_FAILED"
    );
  }

  const title = autoTitle(args.transcription);
  const { error: insertErr } = await supabase.from("recordings").insert({
    id: recordingId,
    user_id: user.id,
    project_id: defaultProject.id,
    title,
    transcription: args.transcription,
    language: args.language,
    duration_seconds: args.durationSeconds,
    audio_storage_path: storagePath,
    audio_mime_type: args.mimeType,
  });
  if (insertErr) {
    void supabase.storage.from("recordings").remove([storagePath]);
    throw new RecordingSaveError(
      `Save failed: ${insertErr.message}`,
      "INSERT_FAILED"
    );
  }

  return { recordingId, projectId: defaultProject.id, title };
};

export const deleteRecording = async (recordingId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("recordings")
    .delete()
    .eq("id", recordingId);
  if (error) throw new Error(`Failed to delete recording: ${error.message}`);
};
