import { derivePipelineUiState } from "@/lib/pipeline/derive-ui-state";
import { getStepperMeta } from "@/lib/pipeline/stage-copy";
import { PIPELINE_CARD_ORDER } from "@/lib/pipeline/cards";
import type { IdeaRunSummary } from "@/types/ideas";
import type { PipelineCardId, PipelineUiState } from "@/types/pipeline-ui";
import type { PipelineStepperStage } from "@/lib/pipeline/stage-copy";

export type M1DashboardLayout = "idle" | "complete" | "failed" | "running";

export type M1DashboardState = {
  layout: M1DashboardLayout;
  uiState: PipelineUiState | null;
};

const CARD_PENDING_STAGE: Partial<
  Record<PipelineCardId, PipelineStepperStage>
> = {
  competitor: "researching",
  prd: "writing_prd",
  brand: "designing_brand",
  engineering: "building_board",
  roadmap: "building_board",
  jira: "building_board",
  confluence: "building_board",
};

export const pendingLabelForCard = (cardId: PipelineCardId): string => {
  const stage = CARD_PENDING_STAGE[cardId];
  if (!stage) return "";
  return getStepperMeta(stage).title;
};

export const deriveM1Dashboard = (
  run: IdeaRunSummary | null,
  transcription: string
): M1DashboardState => {
  if (!run) {
    return { layout: "idle", uiState: null };
  }

  if (run.status === "done") {
    return {
      layout: "complete",
      uiState: derivePipelineUiState({
        variant: "complete",
        pipelineStage: run.currentStage,
        transcription,
      }),
    };
  }

  if (run.status === "failed") {
    return {
      layout: "failed",
      uiState: derivePipelineUiState({
        variant: "failed",
        pipelineStage: run.currentStage,
        transcription,
      }),
    };
  }

  if (run.status === "running" || run.status === "queued") {
    return {
      layout: "running",
      uiState: derivePipelineUiState({
        variant: "running",
        pipelineStage: run.currentStage,
        transcription,
      }),
    };
  }

  return { layout: "idle", uiState: null };
};

export const activeCardIds = (uiState: PipelineUiState): PipelineCardId[] =>
  PIPELINE_CARD_ORDER.filter((id) => uiState.cardStates[id] !== "pending");

export const pendingCardIds = (uiState: PipelineUiState): PipelineCardId[] =>
  PIPELINE_CARD_ORDER.filter((id) => uiState.cardStates[id] === "pending");
