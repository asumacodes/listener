"use client";

import ExpiryBanner from "@/components/pipeline/run/ExpiryBanner";
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

type PipelineCardFeedProps = {
  uiState: PipelineUiState;
  transcription: string;
  onRetry?: () => void;
};

const renderCard = (
  cardId: PipelineCardId,
  state: PipelineCardState,
  transcription: string,
  uiState: PipelineUiState,
  onRetry?: () => void
) => {
  const meta = PIPELINE_CARD_META[cardId];

  if (state === "loading" && uiState.activeLoadingStage) {
    return (
      <PipelineLoadingCard
        key={cardId}
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
          key={cardId}
          title={meta.title}
          link={content.link}
        />
      );
    }
  }

  const content =
    state === "populated"
      ? getMockCardContent(cardId, transcription)
      : undefined;

  const resultState =
    state === "pending" || state === "loading" ? "empty" : state;

  return (
    <PipelineResultCard
      key={cardId}
      title={meta.title}
      state={resultState}
      content={content}
      onRetry={state === "failed" ? onRetry : undefined}
    />
  );
};

const PipelineCardFeed = ({
  uiState,
  transcription,
  onRetry,
}: PipelineCardFeedProps) => (
  <div className="flex flex-col gap-3.5">
    {uiState.showExpiryBanner ? <ExpiryBanner daysRemaining={0} /> : null}
    {uiState.feed.map((cardId) =>
      renderCard(
        cardId,
        uiState.cardStates[cardId],
        transcription,
        uiState,
        onRetry
      )
    )}
  </div>
);

export default PipelineCardFeed;
