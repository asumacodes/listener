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

  // KAN-38 item 4: self-heal a broken/partial signup before the default-project
  // lookup below. This repairs the DEFAULT_PROJECT_MISSING path without granting
  // public.users INSERT access to browser clients.
  const { error: provisionErr } = await supabase.rpc("ensure_user_provisioned");
  if (provisionErr) {
    throw new RecordingSaveError(
      `Provisioning check failed: ${provisionErr.message}`,
      "PROVISIONING_FAILED"
    );
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

  let projectId = defaultProject.id;
  if (args.projectId && args.projectId !== defaultProject.id) {
    const { data: owned, error: ownedErr } = await supabase
      .from("projects")
      .select("id")
      .eq("id", args.projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownedErr || !owned) {
      throw new RecordingSaveError(
        "Project not found",
        "DEFAULT_PROJECT_MISSING"
      );
    }
    projectId = owned.id;
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
  // Cost fields transit the client same as text/language (not billing-facing).
  const { error: insertErr } = await supabase.from("recordings").insert({
    id: recordingId,
    user_id: user.id,
    project_id: projectId,
    title,
    transcription: args.transcription,
    language: args.language,
    duration_seconds: args.durationSeconds,
    audio_storage_path: storagePath,
    audio_mime_type: args.mimeType,
    assemblyai_usd: args.assemblyaiUsd ?? null,
    assemblyai_duration_seconds: args.assemblyaiDurationSeconds ?? null,
    transcript_ready_at: args.transcriptReadyAt ?? null,
    transcription_started_at: args.transcriptionStartedAt ?? null,
  });
  if (insertErr) {
    void supabase.storage.from("recordings").remove([storagePath]);
    throw new RecordingSaveError(
      `Save failed: ${insertErr.message}`,
      "INSERT_FAILED"
    );
  }

  return { recordingId, projectId, title };
};

export const deleteRecording = async (recordingId: string): Promise<void> => {
  const response = await fetch(`/api/murmur/recordings/${recordingId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      `Failed to delete recording: ${body?.error ?? response.statusText}`
    );
  }
};
