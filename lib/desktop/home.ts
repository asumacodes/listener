import { createClient } from "@/lib/supabase/client";
import type {
  DesktopIdeaCardModel,
  DesktopIdeaCardStatus,
  DesktopProjectTab,
} from "@/types/desktop";
import type { PipelineStage, PipelineStatus } from "@/types/pipeline";

const ARTIFACT_COUNT_COMPLETE = 8;

const statusFromRun = (
  status: PipelineStatus | null | undefined
): DesktopIdeaCardStatus => {
  if (!status) return "idle";
  if (status === "done") return "done";
  if (status === "failed") return "failed";
  if (status === "queued") return "queued";
  if (status === "running") return "running";
  return "idle";
};

const stageIndex = (stage: PipelineStage | null): number | null => {
  if (!stage) return null;
  const order: PipelineStage[] = [
    "transcribing",
    "researching",
    "writing_prd",
    "designing_brand",
    "building_board",
  ];
  const idx = order.indexOf(stage);
  if (idx < 0) return null;
  // UI shows STAGE n OF 4 for research→board style; map 5 stages into 1–4 display.
  return Math.min(4, Math.max(1, idx === 0 ? 1 : idx));
};

const oneLine = (transcription: string | null): string => {
  if (!transcription) return "";
  const trimmed = transcription.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 110) return trimmed;
  return `${trimmed.slice(0, 107)}…`;
};

/**
 * Cross-project ideas for the desktop home grid.
 * TODO: replace client aggregation with a dedicated server loader if this
 * query set grows (recordings + latest pipeline_runs + projects).
 */
export const listDesktopHomeIdeas = async (): Promise<{
  projects: DesktopProjectTab[];
  ideas: DesktopIdeaCardModel[];
}> => {
  const supabase = createClient();

  const [
    { data: projects, error: projectError },
    { data: recordings, error: recordingError },
    { data: runs, error: runError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, is_default")
      .order("is_default", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("recordings")
      .select(
        "id, title, transcription, duration_seconds, project_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("pipeline_runs")
      .select("recording_id, status, current_stage, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (projectError || recordingError || runError) {
    throw new Error(
      projectError?.message ??
        recordingError?.message ??
        runError?.message ??
        "Failed to load desktop home"
    );
  }

  const projectName = new Map<string, string>();
  for (const p of projects ?? []) {
    projectName.set(p.id, p.name);
  }

  const latestRun = new Map<
    string,
    { status: PipelineStatus; current_stage: PipelineStage | null }
  >();
  for (const run of runs ?? []) {
    const row = run as {
      recording_id: string;
      status: PipelineStatus;
      current_stage: PipelineStage | null;
    };
    if (!latestRun.has(row.recording_id)) {
      latestRun.set(row.recording_id, {
        status: row.status,
        current_stage: row.current_stage,
      });
    }
  }

  const ideas: DesktopIdeaCardModel[] = (recordings ?? []).map((rec) => {
    const run = latestRun.get(rec.id);
    const status = statusFromRun(run?.status);
    let statusMeta: number | null = null;
    if (status === "done") statusMeta = ARTIFACT_COUNT_COMPLETE;
    else if (status === "running" || status === "failed") {
      statusMeta = stageIndex(run?.current_stage ?? null);
    } else if (status === "queued") {
      // TODO: wire real queue position from run_results / murmur queue API
      statusMeta = null;
    }

    return {
      id: rec.id,
      title: rec.title || "Untitled idea",
      description: oneLine(rec.transcription),
      projectId: rec.project_id,
      projectName: projectName.get(rec.project_id) ?? "Uncategorised",
      createdAt: rec.created_at,
      durationSeconds: rec.duration_seconds ?? 0,
      status,
      statusMeta,
      currentStage: run?.current_stage ?? null,
      latestRunStatus: run?.status ?? null,
    };
  });

  const countByProject = new Map<string, number>();
  for (const idea of ideas) {
    countByProject.set(
      idea.projectId,
      (countByProject.get(idea.projectId) ?? 0) + 1
    );
  }

  const projectTabs: DesktopProjectTab[] = (projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    ideaCount: countByProject.get(p.id) ?? 0,
    isDefault: Boolean(p.is_default),
  }));

  return { projects: projectTabs, ideas };
};
