import { createClient } from "@/lib/supabase/client";
import type { PipelineStatus } from "@/types/pipeline";

import type { ProjectColor } from "@/lib/palette";

export type ProjectRollup = {
  ideaCount: number;
  runningCount: number;
  attentionCount: number;
};

export type ProjectWithRollup = {
  id: string;
  name: string;
  color: ProjectColor;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  recording_count: number;
  rollup: ProjectRollup;
};

export const listProjectsWithRollup = async (): Promise<
  ProjectWithRollup[]
> => {
  const supabase = createClient();

  const [
    { data: projects, error },
    { data: recordings, error: recErr },
    { data: runs, error: runErr },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, name, color, is_default, created_at, updated_at, recordings(count)"
      )
      .order("is_default", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("recordings").select("id, project_id"),
    supabase
      .from("pipeline_runs")
      .select("recording_id, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (error || recErr || runErr) {
    throw new Error(
      error?.message ?? recErr?.message ?? runErr?.message ?? "Failed to load"
    );
  }

  const projectByRecording = new Map<string, string>();
  for (const rec of recordings ?? []) {
    const row = rec as { id: string; project_id: string };
    projectByRecording.set(row.id, row.project_id);
  }

  const rollupByProject = new Map<
    string,
    { running: number; attention: number }
  >();
  const latestRunByRecording = new Map<
    string,
    { recording_id: string; status: PipelineStatus }
  >();
  for (const run of runs ?? []) {
    const row = run as { recording_id: string; status: PipelineStatus };
    if (!latestRunByRecording.has(row.recording_id)) {
      latestRunByRecording.set(row.recording_id, row);
    }
  }

  for (const row of latestRunByRecording.values()) {
    const projectId = projectByRecording.get(row.recording_id);
    if (!projectId) continue;
    const bucket = rollupByProject.get(projectId) ?? {
      running: 0,
      attention: 0,
    };
    if (row.status === "running" || row.status === "queued")
      bucket.running += 1;
    if (row.status === "failed") bucket.attention += 1;
    rollupByProject.set(projectId, bucket);
  }

  return (projects ?? []).map((p) => {
    const row = p as unknown as {
      id: string;
      name: string;
      color: string;
      is_default: boolean;
      created_at: string;
      updated_at: string;
      recordings: { count: number }[];
    };
    const counts = rollupByProject.get(row.id);
    const recording_count = row.recordings?.[0]?.count ?? 0;
    return {
      id: row.id,
      name: row.name,
      color: row.color as ProjectColor,
      is_default: row.is_default,
      created_at: row.created_at,
      updated_at: row.updated_at,
      recording_count,
      rollup: {
        ideaCount: recording_count,
        runningCount: counts?.running ?? 0,
        attentionCount: counts?.attention ?? 0,
      },
    };
  });
};

export const ideaStatusFromRun = (
  status: PipelineStatus | null | undefined
): "ready" | "running" | "attention" | "mapping" => {
  if (!status) return "mapping";
  if (status === "running" || status === "queued") return "running";
  if (status === "failed") return "attention";
  if (status === "done") return "ready";
  return "mapping";
};
