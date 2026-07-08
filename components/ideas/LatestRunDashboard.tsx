"use client";

import M1ActiveCard from "@/components/ideas/M1ActiveCard";
import M1PendingCard from "@/components/ideas/M1PendingCard";
import M1StageBar from "@/components/ideas/M1StageBar";
import PipelineLinkOutCard from "@/components/pipeline/run/PipelineLinkOutCard";
import PipelineResultCard from "@/components/pipeline/run/PipelineResultCard";
import Button from "@/components/ui/Button";
import { M1_CARD_ORDER, M1_CARDS } from "@/lib/ideas/cards";
import { downloadBrandKit } from "@/lib/ideas/brand-kit";
import { canDownloadDoc, downloadCardDoc } from "@/lib/ideas/document-download";
import {
  deriveCardState,
  getRunResultsCardContent,
} from "@/lib/ideas/run-results-content";
import { PIPELINE_CARD_META } from "@/lib/pipeline/cards";
import { ui } from "@/lib/design/ui";
import {
  activeCardIds,
  deriveM1Dashboard,
  pendingCardIds,
} from "@/lib/ideas/derive-m1-dashboard";
import type { M1StageId } from "@/lib/ideas/cards";
import type { IdeaRunSummary } from "@/types/ideas";
import type { DownloadableDoc } from "@/lib/ideas/document-download";
import type { PipelineUiState } from "@/types/pipeline-ui";
import type { RunResults } from "@/types/run-results";
import type { ReactNode } from "react";

type LatestRunDashboardProps = {
  latestRun: IdeaRunSummary | null;
  runResults: RunResults | null;
  transcription: string;
  onRetry?: () => void;
};

const DOWNLOADABLE_DOC_IDS: DownloadableDoc[] = [
  "transcript",
  "competitor",
  "prd",
  "engineering",
];

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

// DONE run: render real cards from run_results. Curated content (ADR-019).
// Grouped stack: dividers between rows only — no trailing border after the last card.
const CompleteDashboard = ({
  runResults,
  transcription,
}: {
  runResults: RunResults | null;
  transcription: string;
}) => (
  <div className={`m1-stack ${ui.resultsStack}`}>
    {M1_CARD_ORDER.map((id) => {
      const state = deriveCardState(id, runResults, transcription);
      const card = M1_CARDS[id];
      const meta = PIPELINE_CARD_META[id];
      const content = getRunResultsCardContent(id, runResults, transcription);

      if (meta.kind === "linkout" || id === "roadmap") {
        if (content && content.id === "confluence") {
          return (
            <PipelineLinkOutCard
              key={id}
              title={card.title}
              link={content.link}
              grouped
            />
          );
        }
        if (content && content.id === "jira") {
          return (
            <PipelineLinkOutCard
              key={id}
              title={card.title}
              link={content.link}
              grouped
            />
          );
        }
      }

      const resultState =
        state === "populated"
          ? "populated"
          : state === "failed"
            ? "failed"
            : "empty";
      let footer: ReactNode = undefined;
      if (id === "brand" && runResults?.brand && resultState === "populated") {
        footer = (
          <Button
            variant="retry"
            className="min-h-10 px-4 text-sm"
            onClick={() => void downloadBrandKit(runResults.brand!)}
          >
            Download brand kit
          </Button>
        );
      } else if (
        DOWNLOADABLE_DOC_IDS.includes(id as DownloadableDoc) &&
        resultState === "populated" &&
        canDownloadDoc(id as DownloadableDoc, runResults)
      ) {
        footer = (
          <Button
            variant="retry"
            className="min-h-10 px-4 text-sm"
            onClick={() => downloadCardDoc(id as DownloadableDoc, runResults!)}
          >
            Download
          </Button>
        );
      }

      return (
        <PipelineResultCard
          key={id}
          title={card.title}
          state={resultState}
          content={content ?? undefined}
          defaultOpen={id === "transcript" || id === "prd"}
          emptyCopy={card.emptyCopy}
          grouped
          footer={footer}
        />
      );
    })}
  </div>
);

const FailedDashboard = ({
  uiState,
  runResults,
  transcription,
  onRetry,
}: {
  uiState: PipelineUiState;
  runResults: RunResults | null;
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
        runResults={runResults}
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
  runResults,
  transcription,
  onRetry,
}: LatestRunDashboardProps) => {
  const { layout, uiState } = deriveM1Dashboard(latestRun, transcription);
  const complete = layout === "complete";

  if (layout === "failed" && uiState) {
    return (
      <div className="embedded-dash">
        <FailedDashboard
          uiState={uiState}
          runResults={runResults}
          transcription={transcription}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (layout === "running" && uiState) {
    return (
      <div className="embedded-dash space-y-3">
        <M1StageBar
          stageState={stageStateForRun(latestRun, false)}
          complete={false}
        />
        <FailedDashboard
          uiState={uiState}
          runResults={runResults}
          transcription={transcription}
        />
      </div>
    );
  }

  if (layout === "idle") {
    return (
      <div className="embedded-dash space-y-3">
        <M1StageBar stageState={{}} complete={false} />
        <div className="m1-stack flex flex-col gap-3">
          {M1_CARD_ORDER.map((id) => (
            <M1PendingCard key={id} id={id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="embedded-dash space-y-3">
      <M1StageBar
        stageState={stageStateForRun(latestRun, complete)}
        complete={complete}
      />
      <CompleteDashboard
        runResults={runResults}
        transcription={transcription}
      />
    </div>
  );
};

export default LatestRunDashboard;
