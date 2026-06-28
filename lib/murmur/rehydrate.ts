import type {
  PipelineRunRow,
  PipelineStage,
  PipelineStatus,
  RunEventRow,
} from "@/types/pipeline";
import { AppState } from "@/types/app-state";

export type DerivedPipelineUi = {
  appState: AppState;
  pipelineStage: PipelineStage | null;
  pipelineError: string | null;
};

export type RehydrateRunInput = Pick<
  PipelineRunRow,
  "status" | "current_stage"
>;

export const deriveStageFromEvents = (
  events: RunEventRow[]
): Pick<DerivedPipelineUi, "pipelineStage" | "pipelineError"> => {
  let pipelineStage: PipelineStage | null = null;
  let pipelineError: string | null = null;

  for (const event of events) {
    if (event.event === "stage_started" || event.event === "stage_done") {
      pipelineStage = event.stage;
    }
    if (event.event === "stage_failed") {
      pipelineStage = event.stage;
      pipelineError = event.detail;
    }
  }

  return { pipelineStage, pipelineError };
};

export const deriveStateFromRun = (
  run: RehydrateRunInput,
  events: RunEventRow[]
): DerivedPipelineUi => {
  const { pipelineStage: eventStage, pipelineError } =
    deriveStageFromEvents(events);
  const pipelineStage = eventStage ?? run.current_stage ?? null;

  if (run.status === "done") {
    return {
      appState: AppState.PIPELINE_DONE,
      pipelineStage,
      pipelineError: null,
    };
  }

  if (run.status === "failed") {
    return {
      appState: AppState.PIPELINE_FAILED,
      pipelineStage,
      pipelineError: pipelineError ?? "Pipeline failed",
    };
  }

  const failedEvent = [...events]
    .reverse()
    .find((e) => e.event === "stage_failed");
  if (failedEvent) {
    return {
      appState: AppState.PIPELINE_FAILED,
      pipelineStage,
      pipelineError: failedEvent.detail ?? "Stage failed",
    };
  }

  // queued = handed to the Bridge, awaiting the first stage_started. This is a
  // healthy pending state; the stall watchdog owns the "stuck queued" case.
  if (run.status === "queued") {
    return {
      appState: AppState.PIPELINE_RUNNING,
      pipelineStage,
      pipelineError: null,
    };
  }

  return {
    appState: AppState.PIPELINE_RUNNING,
    pipelineStage,
    pipelineError: null,
  };
};

export const derivePipelineUi = (
  status: PipelineStatus,
  events: RunEventRow[]
): DerivedPipelineUi =>
  deriveStateFromRun({ status, current_stage: null }, events);
