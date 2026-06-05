// Pipeline stage identifiers — must match run_events.stage exactly (verified
// against real Bridge output: transcribing/researching/writing_prd/
// designing_brand/building_board).

export type PipelineStage =
  | "transcribing"
  | "researching"
  | "writing_prd"
  | "designing_brand"
  | "building_board";

export type PipelineEventType = "stage_started" | "stage_done" | "stage_failed";

export type PipelineStatus = "queued" | "running" | "done" | "failed";

export type HandoffReason =
  | "invalid_signature"
  | "minutes_exhausted"
  | "bad_response"
  | "unreachable"
  | "create_failed"
  | "handoff_failed"
  | "not_retryable"
  | "recording_unavailable";

export type RunEventRow = {
  run_id: string;
  stage: PipelineStage;
  event: PipelineEventType;
  detail: string | null;
  created_at: string;
};

export type PipelineRunRow = {
  id: string;
  recording_id?: string;
  user_id?: string;
  status: PipelineStatus;
  current_stage?: PipelineStage | null;
};

const PIPELINE_STAGES: PipelineStage[] = [
  "transcribing",
  "researching",
  "writing_prd",
  "designing_brand",
  "building_board",
];

const PIPELINE_EVENT_TYPES: PipelineEventType[] = [
  "stage_started",
  "stage_done",
  "stage_failed",
];

export const isPipelineStage = (value: unknown): value is PipelineStage =>
  typeof value === "string" && PIPELINE_STAGES.includes(value as PipelineStage);

export const isPipelineEventType = (
  value: unknown
): value is PipelineEventType =>
  typeof value === "string" &&
  PIPELINE_EVENT_TYPES.includes(value as PipelineEventType);

export const isRunEventRow = (value: unknown): value is RunEventRow => {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.run_id === "string" &&
    isPipelineStage(row.stage) &&
    isPipelineEventType(row.event) &&
    (row.detail === null || typeof row.detail === "string") &&
    typeof row.created_at === "string"
  );
};

export const stageLabel = (stage: PipelineStage): string =>
  stage.replace(/_/g, " ");
