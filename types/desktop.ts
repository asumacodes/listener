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
  /**
   * done: artifact count; running / failed: stage index 1–4; queued: always
   * null — handed off with no stage started. One run per user (ADR-037(d)):
   * there is no queue, so never put a "position" here.
   */
  statusMeta: number | null;
  currentStage: PipelineStage | null;
  latestRunStatus: PipelineStatus | null;
  /** Legacy row saved with no usable transcript; kept only because it was run. */
  noSpeech: boolean;
};

export type DesktopProjectTab = {
  id: string;
  name: string;
  ideaCount: number;
  isDefault: boolean;
};
