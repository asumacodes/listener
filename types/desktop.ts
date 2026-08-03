import type { PipelineStage, PipelineStatus } from "@/types/pipeline";

/** Desktop home grid card — shared shape for real + placeholder data. */
export type DesktopIdeaCardStatus =
  | "done"
  | "running"
  | "failed"
  | "queued"
  | "idle";

export type DesktopIdeaCardModel = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  durationSeconds: number;
  status: DesktopIdeaCardStatus;
  /** done: artifact count; running: stage index 1–4; queued: queue position; failed: stage index */
  statusMeta: number | null;
  currentStage: PipelineStage | null;
  latestRunStatus: PipelineStatus | null;
};

export type DesktopProjectTab = {
  id: string;
  name: string;
  ideaCount: number;
  isDefault: boolean;
};
