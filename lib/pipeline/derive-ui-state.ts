import { copy } from "@/lib/design/copy";
import {
  PIPELINE_CARD_ORDER,
  STAGE_CARD_MAP,
  STAGE_LOADING_CARD,
} from "@/lib/pipeline/cards";
import {
  normalizeStepperStage,
  PIPELINE_STEPPER_ORDER,
} from "@/lib/pipeline/stage-copy";
import type {
  DerivePipelineUiArgs,
  PipelineCardId,
  PipelineCardState,
  PipelineUiState,
} from "@/types/pipeline-ui";
import type { PipelineStage } from "@/types/pipeline";

const DROPPED_STATES: PipelineCardState[] = ["populated", "empty", "failed"];

const emptyCardStates = (): Record<PipelineCardId, PipelineCardState> => ({
  transcript: "pending",
  competitor: "pending",
  prd: "pending",
  brand: "pending",
  engineering: "pending",
  roadmap: "pending",
  jira: "pending",
  confluence: "pending",
});

const populateStageCards = (
  states: Record<PipelineCardId, PipelineCardState>,
  stage: Exclude<PipelineStage, "transcribing">
) => {
  for (const cardId of STAGE_CARD_MAP[stage]) {
    states[cardId] = "populated";
  }
};

const buildFeed = (
  cardStates: Record<PipelineCardId, PipelineCardState>,
  complete: boolean
): PipelineCardId[] => {
  if (complete) {
    return PIPELINE_CARD_ORDER.slice();
  }

  const dropped = PIPELINE_CARD_ORDER.filter((id) =>
    DROPPED_STATES.includes(cardStates[id])
  );
  const loadingId = PIPELINE_CARD_ORDER.find(
    (id) => cardStates[id] === "loading"
  );

  const feed = dropped.slice().reverse();
  if (loadingId) {
    return [loadingId, ...feed];
  }
  return feed;
};

export const derivePipelineUiState = ({
  variant,
  pipelineStage,
  showExpiryBanner = false,
  showLongerHint = false,
  handoffReason = null,
}: DerivePipelineUiArgs): PipelineUiState => {
  const cardStates = emptyCardStates();
  let title = "Building your idea…";
  let activeLoadingCard: PipelineCardId | null = null;
  let activeLoadingStage: PipelineStage | null = null;
  let failedStage: PipelineStage | null = null;

  cardStates.transcript = "populated";

  if (variant === "complete") {
    title = copy.success.ideaReady;
    for (const stage of PIPELINE_STEPPER_ORDER) {
      populateStageCards(cardStates, stage);
    }
    return {
      title,
      showExpiryBanner,
      showLongerHint: false,
      feed: buildFeed(cardStates, true),
      cardStates,
      activeLoadingCard: null,
      activeLoadingStage: null,
      failedStage: null,
    };
  }

  if (variant === "failed") {
    if (handoffReason === "atlassian_required") {
      title = "Connect Atlassian to run Murmur";
    } else if (handoffReason === "run_in_progress") {
      title = "You already have a run in progress.";
    } else if (handoffReason === "out_of_quota") {
      title = "You've used your free idea.";
    }

    const failed = normalizeStepperStage(pipelineStage);
    failedStage = failed;
    const failedIndex = PIPELINE_STEPPER_ORDER.indexOf(failed);

    for (let i = 0; i < failedIndex; i++) {
      populateStageCards(cardStates, PIPELINE_STEPPER_ORDER[i]);
    }

    for (const cardId of STAGE_CARD_MAP[failed]) {
      cardStates[cardId] = "failed";
    }

    return {
      title,
      showExpiryBanner: false,
      showLongerHint: false,
      feed: buildFeed(cardStates, false),
      cardStates,
      activeLoadingCard: null,
      activeLoadingStage: null,
      failedStage,
    };
  }

  const activeStage = normalizeStepperStage(pipelineStage);
  const activeIndex = PIPELINE_STEPPER_ORDER.indexOf(activeStage);

  for (let i = 0; i < activeIndex; i++) {
    populateStageCards(cardStates, PIPELINE_STEPPER_ORDER[i]);
  }

  activeLoadingCard = STAGE_LOADING_CARD[activeStage];
  activeLoadingStage = activeStage;
  cardStates[activeLoadingCard] = "loading";

  return {
    title,
    showExpiryBanner: false,
    showLongerHint,
    feed: buildFeed(cardStates, false),
    cardStates,
    activeLoadingCard,
    activeLoadingStage,
    failedStage: null,
  };
};
