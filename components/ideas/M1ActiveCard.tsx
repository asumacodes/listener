"use client";

import PipelineLinkOutCard from "@/components/pipeline/run/PipelineLinkOutCard";
import PipelineLoadingCard from "@/components/pipeline/run/PipelineLoadingCard";
import PipelineResultCard from "@/components/pipeline/run/PipelineResultCard";
import { getRunResultsCardContent } from "@/lib/ideas/run-results-content";
import { PIPELINE_CARD_META } from "@/lib/pipeline/cards";
import type {
  PipelineCardContent,
  PipelineCardId,
  PipelineCardState,
  PipelineUiState,
} from "@/types/pipeline-ui";
import type { RunResults } from "@/types/run-results";

type M1ActiveCardProps = {
  cardId: PipelineCardId;
  state: PipelineCardState;
  uiState: PipelineUiState;
  transcription: string;
  runResults: RunResults | null;
  onRetry?: () => void;
};

const M1ActiveCard = ({
  cardId,
  state,
  uiState,
  transcription,
  runResults,
  onRetry,
}: M1ActiveCardProps) => {
  const meta = PIPELINE_CARD_META[cardId];
  const content =
    state === "populated"
      ? getActiveCardContent(cardId, runResults, transcription)
      : undefined;

  if (state === "loading" && uiState.activeLoadingStage) {
    return <PipelineLoadingCard stage={uiState.activeLoadingStage} />;
  }

  if (state === "populated" && meta.kind === "linkout") {
    if (content?.id === "jira" || content?.id === "confluence") {
      return (
        <PipelineLinkOutCard
          title={meta.title}
          link={content.link}
          elevated={false}
        />
      );
    }
  }

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
      content={content ?? undefined}
      defaultOpen={state === "populated"}
      onRetry={state === "failed" ? onRetry : undefined}
      elevated={false}
    />
  );
};

const getActiveCardContent = (
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

export default M1ActiveCard;
