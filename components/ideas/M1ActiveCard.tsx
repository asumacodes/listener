"use client";

import PipelineLinkOutCard from "@/components/pipeline/run/PipelineLinkOutCard";
import PipelineLoadingCard from "@/components/pipeline/run/PipelineLoadingCard";
import PipelineResultCard from "@/components/pipeline/run/PipelineResultCard";
import {
  getMockCardContent,
  PIPELINE_CARD_META,
} from "@/lib/pipeline/mock-data";
import type {
  PipelineCardId,
  PipelineCardState,
  PipelineUiState,
} from "@/types/pipeline-ui";

type M1ActiveCardProps = {
  cardId: PipelineCardId;
  state: PipelineCardState;
  uiState: PipelineUiState;
  transcription: string;
  onRetry?: () => void;
};

const M1ActiveCard = ({
  cardId,
  state,
  uiState,
  transcription,
  onRetry,
}: M1ActiveCardProps) => {
  const meta = PIPELINE_CARD_META[cardId];

  if (state === "loading" && uiState.activeLoadingStage) {
    return (
      <PipelineLoadingCard
        stage={uiState.activeLoadingStage}
        showLongerHint={uiState.showLongerHint}
      />
    );
  }

  if (state === "populated" && meta.kind === "linkout") {
    const content = getMockCardContent(cardId, transcription);
    if (content.id === "jira" || content.id === "confluence") {
      return (
        <PipelineLinkOutCard
          title={meta.title}
          link={content.link}
          elevated={false}
        />
      );
    }
  }

  const content =
    state === "populated"
      ? getMockCardContent(cardId, transcription)
      : undefined;

  const resultState =
    state === "pending" || state === "loading"
      ? "empty"
      : state === "failed"
        ? "failed"
        : state;

  return (
    <PipelineResultCard
      title={meta.title}
      state={resultState}
      content={content}
      defaultOpen={state === "populated"}
      onRetry={state === "failed" ? onRetry : undefined}
      elevated={false}
    />
  );
};

export default M1ActiveCard;
