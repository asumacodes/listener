import { M1_CARD_ORDER } from "@/lib/ideas/cards";
import { STAGE_CARD_MAP } from "@/lib/pipeline/cards";
import {
  normalizeStepperStage,
  PIPELINE_STEPPER_ORDER,
  type PipelineStepperStage,
} from "@/lib/pipeline/stage-copy";
import type { M1CardId } from "@/types/ideas";
import type {
  PipelineStage,
  PipelineStatus,
  RunEventRow,
} from "@/types/pipeline";

export type StageStatus = "pending" | "running" | "done" | "failed";
export type StageStatusMap = Record<PipelineStepperStage, StageStatus>;

/**
 * Which stage owns each artifact. Inverted from STAGE_CARD_MAP.
 * `transcript` is absent — pre-run, never stage-gated (KAN-81).
 */
export const ARTIFACT_STAGE: Partial<Record<M1CardId, PipelineStepperStage>> =
  Object.fromEntries(
    PIPELINE_STEPPER_ORDER.flatMap((stage) =>
      STAGE_CARD_MAP[stage].map((cardId) => [cardId, stage])
    )
  ) as Partial<Record<M1CardId, PipelineStepperStage>>;

const allPending = (): StageStatusMap => ({
  researching: "pending",
  writing_prd: "pending",
  designing_brand: "pending",
  building_board: "pending",
});

/**
 * Per-stage status, distinct from artifact payload presence.
 * run_events authoritative when present; else reconstruct from status + current_stage.
 */
export const deriveStageStatuses = ({
  status,
  currentStage,
  events,
}: {
  status: PipelineStatus | null | undefined;
  currentStage: PipelineStage | null | undefined;
  events?: RunEventRow[];
}): StageStatusMap => {
  const map = allPending();

  if (status === "done") {
    for (const stage of PIPELINE_STEPPER_ORDER) map[stage] = "done";
    return map;
  }
  if (!status || status === "queued") return map;

  let sawEvent = false;
  for (const e of events ?? []) {
    if (e.stage === "transcribing") continue;
    const stage = e.stage as PipelineStepperStage;
    if (!PIPELINE_STEPPER_ORDER.includes(stage)) continue;
    sawEvent = true;
    if (e.event === "stage_failed") map[stage] = "failed";
    else if (e.event === "stage_done") map[stage] = "done";
    else if (e.event === "stage_started") map[stage] = "running";
  }
  if (sawEvent) return map;

  const active = normalizeStepperStage(currentStage ?? null);
  const activeIdx = PIPELINE_STEPPER_ORDER.indexOf(active);
  for (let i = 0; i < activeIdx; i++) {
    map[PIPELINE_STEPPER_ORDER[i]] = "done";
  }
  map[active] = status === "failed" ? "failed" : "running";
  return map;
};

export type ArtifactWaitState = "render" | "writing" | "pending" | "empty";

/**
 * Pane state for one artifact. Gate is stage status — hasData only splits
 * rendered vs empty once the stage is done.
 */
export const artifactWaitState = ({
  cardId,
  stageStatuses,
  hasData,
  allowEmpty = true,
}: {
  cardId: M1CardId;
  stageStatuses: StageStatusMap;
  hasData: boolean;
  allowEmpty?: boolean;
}): ArtifactWaitState => {
  const stage = ARTIFACT_STAGE[cardId];
  if (!stage) return "render";

  const status = stageStatuses[stage];
  if (status === "running") return "writing";
  if (status === "pending") return "pending";
  if (status === "failed") return "render"; // FailedReadingPane owns failed
  if (status === "done" && !hasData && allowEmpty) return "empty";
  return "render";
};

export const artifactIndexLabel = (cardId: M1CardId): string =>
  String(M1_CARD_ORDER.indexOf(cardId) + 1).padStart(2, "0");

export const blockingStage = (
  cardId: M1CardId
): PipelineStepperStage | null => {
  const stage = ARTIFACT_STAGE[cardId];
  if (!stage) return null;
  const idx = PIPELINE_STEPPER_ORDER.indexOf(stage);
  return idx > 0 ? PIPELINE_STEPPER_ORDER[idx - 1] : null;
};
