import { isRunResultsExpired } from "@/lib/ideas/run-expiry";
import { attachSignedPlaybackUrls } from "@/lib/recordings/server";
import { createClient } from "@/lib/supabase/server";
import type {
  IdeaDetailData,
  IdeaDetailProject,
  IdeaRunSummary,
} from "@/types/ideas";
import type { PipelineStage, PipelineStatus } from "@/types/pipeline";
import { isPipelineStage } from "@/types/pipeline";

const RECORDING_SELECT =
  "id, title, transcription, language, duration_seconds, audio_storage_path, created_at, project_id";

type RecordingRow = {
  id: string;
  title: string;
  transcription: string;
  language: string | null;
  duration_seconds: number;
  audio_storage_path: string;
  created_at: string;
  project_id: string;
};

type RunRow = {
  id: string;
  status: PipelineStatus;
  current_stage: PipelineStage | null;
  created_at: string;
};

export const getIdeaDetail = async (
  recordingId: string
): Promise<IdeaDetailData | null> => {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("recordings")
    .select(RECORDING_SELECT)
    .eq("id", recordingId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load recording: ${error.message}`);
  }
  if (!row) return null;

  const recordingRow = row as RecordingRow;
  const [withUrl] = await attachSignedPlaybackUrls(supabase, [recordingRow]);

  const { data: projectRow } = await supabase
    .from("projects")
    .select("id, name, color, is_default")
    .eq("id", recordingRow.project_id)
    .maybeSingle();

  const { data: runs, error: runsError } = await supabase
    .from("pipeline_runs")
    .select("id, status, current_stage, created_at")
    .eq("recording_id", recordingId)
    .order("created_at", { ascending: false });

  if (runsError) {
    throw new Error(`Failed to load runs: ${runsError.message}`);
  }

  const project: IdeaDetailProject = projectRow
    ? {
        id: projectRow.id,
        name: projectRow.name,
        color: projectRow.color,
        isDefault: projectRow.is_default,
      }
    : {
        id: recordingRow.project_id,
        name: "Uncategorised",
        color: "sand",
        isDefault: true,
      };

  const runSummaries: IdeaRunSummary[] = ((runs ?? []) as RunRow[]).map(
    (r) => ({
      id: r.id,
      status: r.status,
      currentStage:
        r.current_stage && isPipelineStage(r.current_stage)
          ? r.current_stage
          : null,
      createdAt: r.created_at,
    })
  );

  const latestRun = runSummaries[0] ?? null;

  return {
    recording: {
      id: recordingRow.id,
      title: recordingRow.title,
      transcription: recordingRow.transcription,
      language: recordingRow.language,
      durationSeconds: recordingRow.duration_seconds,
      createdAt: recordingRow.created_at,
      signedUrl: withUrl.signedUrl,
    },
    project,
    runs: runSummaries,
    latestRun,
    resultsExpired: isRunResultsExpired(latestRun, project.isDefault),
  };
};

export const getRecordingIdForRun = async (
  runId: string
): Promise<string | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pipeline_runs")
    .select("recording_id")
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load run: ${error.message}`);
  }
  return (data?.recording_id as string | undefined) ?? null;
};
