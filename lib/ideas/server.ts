import {
  getRetentionPhase,
  graceDaysRemaining,
  isRunResultsExpired,
} from "@/lib/ideas/run-expiry";
import { attachSignedPlaybackUrls } from "@/lib/recordings/server";
import { createClient } from "@/lib/supabase/server";
import type {
  IdeaDetailData,
  IdeaDetailProject,
  IdeaRunSummary,
  RunRetention,
} from "@/types/ideas";
import type { RunResults } from "@/types/run-results";
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
  retention_tier: string | null;
  expires_at: string | null;
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
    .select("id, status, current_stage, created_at, retention_tier, expires_at")
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
      retention: {
        retentionTier: r.retention_tier ?? "default",
        expiresAt: r.expires_at ?? null,
      },
    })
  );

  const latestRun = runSummaries[0] ?? null;

  // Fetch run_results for the latest run only (the dashboard renders the latest
  // run; older runs are reached via RunHistory which re-loads per run later).
  let latestRunResults: RunResults | null = null;
  let latestRunRetention: RunRetention | null = null;

  if (latestRun) {
    // `transcript` column lands with ADR-021; omit from select until migration is applied.
    const { data: resultsRow } = await supabase
      .from("run_results")
      .select("prd, competitors, brand, engineering, jira, confluence")
      .eq("run_id", latestRun.id)
      .maybeSingle();

    if (resultsRow) {
      latestRunResults = {
        transcript: null,
        prd: (resultsRow.prd as RunResults["prd"]) ?? null,
        competitors:
          (resultsRow.competitors as RunResults["competitors"]) ?? null,
        brand: (resultsRow.brand as RunResults["brand"]) ?? null,
        engineering:
          (resultsRow.engineering as RunResults["engineering"]) ?? null,
        jira: (resultsRow.jira as RunResults["jira"]) ?? null,
        confluence: (resultsRow.confluence as RunResults["confluence"]) ?? null,
      };
    }

    latestRunRetention = latestRun.retention;
  }

  const phase = getRetentionPhase(latestRun, latestRunRetention);

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
    latestRunResults,
    latestRunRetention,
    resultsExpired: isRunResultsExpired(latestRun, latestRunRetention),
    inGracePeriod: phase === "grace",
    graceDaysRemaining:
      phase === "grace" ? graceDaysRemaining(latestRunRetention) : 0,
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
