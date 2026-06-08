"use client";

import M1ActiveCard from "@/components/ideas/M1ActiveCard";
import M1Card from "@/components/ideas/M1Card";
import M1PendingCard from "@/components/ideas/M1PendingCard";
import M1StageBar from "@/components/ideas/M1StageBar";
import { M1_CARD_ORDER } from "@/lib/ideas/cards";
import {
  activeCardIds,
  deriveM1Dashboard,
  pendingCardIds,
} from "@/lib/ideas/derive-m1-dashboard";
import type { M1StageId } from "@/lib/ideas/cards";
import type { IdeaRunSummary, M1CardState } from "@/types/ideas";
import type { PipelineUiState } from "@/types/pipeline-ui";

type LatestRunDashboardProps = {
  latestRun: IdeaRunSummary | null;
  transcription: string;
  onRetry?: () => void;
};

const cardStatesForRun = (
  run: IdeaRunSummary | null
): Record<(typeof M1_CARD_ORDER)[number], M1CardState> => {
  const base = Object.fromEntries(
    M1_CARD_ORDER.map((id) => [id, "pending" as M1CardState])
  ) as Record<(typeof M1_CARD_ORDER)[number], M1CardState>;

  if (!run) return base;

  if (run.status === "running" || run.status === "queued") {
    base.transcript = "loading";
    return base;
  }

  if (run.status === "done") {
    for (const id of M1_CARD_ORDER) {
      base[id] = id === "competitor" ? "empty" : "populated";
    }
    return base;
  }

  return base;
};

const stageStateForRun = (
  run: IdeaRunSummary | null,
  complete: boolean
): Partial<Record<M1StageId, "pending" | "active" | "done" | "failed">> => {
  if (complete) {
    return {
      transcribe: "done",
      research: "done",
      prd: "done",
      brand: "done",
      board: "done",
    };
  }
  if (!run || run.status === "failed") {
    return { transcribe: "done", research: "done", prd: "failed" };
  }
  if (run.status === "running" || run.status === "queued") {
    return {
      transcribe: "done",
      research: "active",
      prd: "pending",
      brand: "pending",
      board: "pending",
    };
  }
  return {};
};

const CompleteDashboard = ({
  cardState,
}: {
  cardState: Record<(typeof M1_CARD_ORDER)[number], M1CardState>;
}) => (
  <div className="m1-stack flex flex-col gap-3">
    {M1_CARD_ORDER.map((id) => (
      <M1Card
        key={id}
        id={id}
        state={cardState[id]}
        defaultOpen={id === "transcript" || id === "competitor"}
      />
    ))}
  </div>
);

const FailedDashboard = ({
  uiState,
  transcription,
  onRetry,
}: {
  uiState: PipelineUiState;
  transcription: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col gap-3">
    {activeCardIds(uiState).map((id) => (
      <M1ActiveCard
        key={id}
        cardId={id}
        state={uiState.cardStates[id]}
        uiState={uiState}
        transcription={transcription}
        onRetry={onRetry}
      />
    ))}
    {pendingCardIds(uiState).map((id) => (
      <M1PendingCard key={id} id={id} />
    ))}
  </div>
);

const LatestRunDashboard = ({
  latestRun,
  transcription,
  onRetry,
}: LatestRunDashboardProps) => {
  const { layout, uiState } = deriveM1Dashboard(latestRun, transcription);
  const complete = layout === "complete";
  const cardState = cardStatesForRun(latestRun);
  const stageState = stageStateForRun(latestRun, complete);

  if (layout === "failed" && uiState) {
    return (
      <div className="embedded-dash">
        <FailedDashboard
          uiState={uiState}
          transcription={transcription}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="embedded-dash space-y-3">
      <M1StageBar stageState={stageState} complete={complete} />
      <CompleteDashboard cardState={cardState} />
    </div>
  );
};

export default LatestRunDashboard;
