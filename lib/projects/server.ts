import { attachSignedPlaybackUrls } from "@/lib/recordings/server";
import { createClient } from "@/lib/supabase/server";
import type {
  ProjectDetailHeader,
  ProjectDetailRecording,
} from "@/types/project";

const PROJECT_SELECT = "id, name, color, is_default";

const PROJECT_RECORDING_SELECT =
  "id, title, transcription, language, duration_seconds, audio_storage_path, created_at";

export const getProjectWithRecordings = async (
  id: string
): Promise<{
  project: ProjectDetailHeader | null;
  recordings: ProjectDetailRecording[];
}> => {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (projectError) {
    throw new Error(`Failed to load project: ${projectError.message}`);
  }

  if (!project) {
    return { project: null, recordings: [] };
  }

  const { data: rows, error: recordingsError } = await supabase
    .from("recordings")
    .select(PROJECT_RECORDING_SELECT)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (recordingsError) {
    throw new Error(`Failed to load recordings: ${recordingsError.message}`);
  }

  const withUrls = await attachSignedPlaybackUrls(supabase, rows ?? []);

  const recordingIds = (rows ?? []).map((r) => r.id);
  const latestRunByRecording = new Map<string, string>();

  if (recordingIds.length > 0) {
    const { data: runRows } = await supabase
      .from("pipeline_runs")
      .select("recording_id, status, created_at")
      .in("recording_id", recordingIds)
      .order("created_at", { ascending: false });

    for (const run of runRows ?? []) {
      const row = run as { recording_id: string; status: string };
      if (!latestRunByRecording.has(row.recording_id)) {
        latestRunByRecording.set(row.recording_id, row.status);
      }
    }
  }

  const recordings: ProjectDetailRecording[] = withUrls.map(
    ({ audio_storage_path, signedUrl, ...rest }) => {
      void audio_storage_path;
      return {
        ...rest,
        signedUrl,
        latestRunStatus:
          (latestRunByRecording.get(
            rest.id
          ) as ProjectDetailRecording["latestRunStatus"]) ?? null,
      };
    }
  );

  return {
    project: project as ProjectDetailHeader,
    recordings,
  };
};
