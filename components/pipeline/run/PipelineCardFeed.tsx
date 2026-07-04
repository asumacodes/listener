"use client";

import ExpiryBanner from "@/components/pipeline/run/ExpiryBanner";
import PipelineLinkOutCard from "@/components/pipeline/run/PipelineLinkOutCard";
import PipelineLoadingCard from "@/components/pipeline/run/PipelineLoadingCard";
import PipelineResultCard from "@/components/pipeline/run/PipelineResultCard";
import { getRunResultsCardContent } from "@/lib/ideas/run-results-content";
import { PIPELINE_CARD_META } from "@/lib/pipeline/cards";
import type {
  PipelineCardId,
  PipelineCardContent,
  PipelineCardState,
  PipelineUiState,
} from "@/types/pipeline-ui";
import type { RunResults } from "@/types/run-results";

type PipelineCardFeedProps = {
  uiState: PipelineUiState;
  transcription: string;
  runResults: RunResults | null;
  onRetry?: () => void;
  onRefresh?: () => void;
};

const getLiveCardContent = (
  cardId: PipelineCardId,
  runResults: RunResults | null,
  transcription: string
): PipelineCardContent | null => {
  if (cardId === "transcript") {
    const text = transcription.trim();
    return text ? { id: "transcript", text } : null;
  }
  return getRunResultsCardContent(cardId, runResults, transcription);
};

const renderCard = (
  cardId: PipelineCardId,
  state: PipelineCardState,
  transcription: string,
  runResults: RunResults | null,
  uiState: PipelineUiState,
  onRetry?: () => void,
  onRefresh?: () => void
) => {
  const meta = PIPELINE_CARD_META[cardId];

  if (state === "loading" && uiState.activeLoadingStage) {
    return (
      <PipelineLoadingCard key={cardId} stage={uiState.activeLoadingStage} />
    );
  }

  if (state === "populated") {
    const content = getLiveCardContent(cardId, runResults, transcription);
    if (!content) return null;

    if (content.id === "jira" || content.id === "confluence") {
      return (
        <PipelineLinkOutCard
          key={cardId}
          title={meta.title}
          link={content.link}
        />
      );
    }

    return (
      <PipelineResultCard
        key={cardId}
        title={meta.title}
        state="populated"
        content={content}
        onRetry={undefined}
      />
    );
  }

  const resultState =
    state === "pending" || state === "loading" ? "empty" : state;

  return (
    <PipelineResultCard
      key={cardId}
      title={meta.title}
      state={resultState}
      content={undefined}
      onRetry={state === "failed" ? onRetry : undefined}
    />
  );
};

const PipelineCardFeed = ({
  uiState,
  transcription,
  runResults,
  onRetry,
  onRefresh,
}: PipelineCardFeedProps) => (
  <div className="flex flex-col gap-3.5">
    {uiState.showExpiryBanner ? <ExpiryBanner daysRemaining={0} /> : null}
    {uiState.feed.map((cardId) =>
      renderCard(
        cardId,
        uiState.cardStates[cardId],
        transcription,
        runResults,
        uiState,
        onRetry,
        onRefresh
      )
    )}
  </div>
);

export default PipelineCardFeed;
