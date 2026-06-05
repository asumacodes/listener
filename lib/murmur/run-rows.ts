import type { PipelineRunRow, RunEventRow } from "@/types/pipeline";
import {
  isPipelineEventType,
  isPipelineStage,
  isRunEventRow,
} from "@/types/pipeline";

export const toRunEventRow = (value: unknown): RunEventRow | null => {
  if (isRunEventRow(value)) return value;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.run_id === "string" &&
    isPipelineStage(row.stage) &&
    isPipelineEventType(row.event) &&
    (row.detail === null ||
      row.detail === undefined ||
      typeof row.detail === "string") &&
    typeof row.created_at === "string"
  ) {
    return {
      run_id: row.run_id,
      stage: row.stage,
      event: row.event,
      detail: (row.detail as string | null) ?? null,
      created_at: row.created_at,
    };
  }
  return null;
};

export const toPipelineRunRow = (value: unknown): PipelineRunRow | null => {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.status !== "string") return null;
  const status = row.status;
  if (
    status !== "queued" &&
    status !== "running" &&
    status !== "done" &&
    status !== "failed"
  ) {
    return null;
  }
  const currentStage =
    row.current_stage === null || row.current_stage === undefined
      ? null
      : isPipelineStage(row.current_stage)
        ? row.current_stage
        : null;
  return {
    id: row.id,
    status,
    current_stage: currentStage,
  };
};
