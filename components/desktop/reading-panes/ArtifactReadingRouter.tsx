"use client";

import BrandKitPane from "@/components/desktop/reading-panes/BrandKitPane";
import CompetitorMapPane from "@/components/desktop/reading-panes/CompetitorMapPane";
import EngineeringBriefPane from "@/components/desktop/reading-panes/EngineeringBriefPane";
import {
  ArtifactEmptyPane,
  ArtifactPendingPane,
  ArtifactWritingPane,
} from "@/components/desktop/reading-panes/ArtifactWaitStates";
import {
  ConfluenceLinkPane,
  JiraLinkPane,
  RoadmapLinkPane,
} from "@/components/desktop/reading-panes/LinkOutPanes";
import PrdPane from "@/components/desktop/reading-panes/PrdPane";
import TranscriptPane from "@/components/desktop/reading-panes/TranscriptPane";
import { M1_CARD_ORDER } from "@/lib/ideas/cards";
import { deriveCardState } from "@/lib/ideas/run-results-content";
import {
  artifactWaitState,
  type StageStatusMap,
} from "@/lib/pipeline/artifact-stage";
import { PIPELINE_CARD_META } from "@/lib/pipeline/cards";
import type { IdeaDetailData, M1CardId } from "@/types/ideas";
import type { PipelineStatus } from "@/types/pipeline";

type ArtifactReadingRouterProps = {
  selected: M1CardId;
  data: IdeaDetailData;
  streaming?: boolean;
  canKickoff?: boolean;
  /** Per-stage status — the gate key. Payload presence never decides state. */
  stageStatuses: StageStatusMap;
  runStatus?: PipelineStatus | null;
  onSelectArtifact?: (id: M1CardId) => void;
};

const ArtifactReadingRouter = ({
  selected,
  data,
  streaming = false,
  canKickoff = true,
  stageStatuses,
  runStatus = null,
  onSelectArtifact,
}: ArtifactReadingRouterProps) => {
  const results = data.latestRunResults;

  const hasData = (id: M1CardId) =>
    deriveCardState(id, results, data.recording.transcription) === "populated";

  // Failed runs keep FailedReadingPane; "up next" would be a lie there.
  if (runStatus !== "failed") {
    const wait = artifactWaitState({
      cardId: selected,
      stageStatuses,
      hasData: hasData(selected),
      allowEmpty: PIPELINE_CARD_META[selected]?.kind !== "linkout",
    });

    if (wait === "writing") {
      const ready = M1_CARD_ORDER.filter(
        (id) =>
          id !== selected &&
          PIPELINE_CARD_META[id]?.kind !== "linkout" &&
          artifactWaitState({
            cardId: id,
            stageStatuses,
            hasData: hasData(id),
          }) === "render"
      );
      return (
        <ArtifactWritingPane
          cardId={selected}
          readyArtifacts={ready}
          onSelectArtifact={onSelectArtifact}
        />
      );
    }

    if (wait === "pending") {
      return (
        <ArtifactPendingPane
          cardId={selected}
          onSelectArtifact={onSelectArtifact}
        />
      );
    }

    if (wait === "empty") {
      return (
        <ArtifactEmptyPane
          cardId={selected}
          finishedAt={data.latestRun?.createdAt ?? null}
          onSelectArtifact={onSelectArtifact}
        />
      );
    }
  }

  switch (selected) {
    case "transcript":
      return (
        <TranscriptPane
          data={data}
          streaming={streaming}
          canKickoff={canKickoff}
        />
      );
    case "competitor":
      return <CompetitorMapPane results={results} streaming={streaming} />;
    case "prd":
      return (
        <PrdPane
          results={results}
          ideaTitle={data.recording.title}
          streaming={streaming}
        />
      );
    case "brand":
      return <BrandKitPane results={results} streaming={streaming} />;
    case "engineering":
      return <EngineeringBriefPane results={results} streaming={streaming} />;
    case "roadmap":
      return (
        <RoadmapLinkPane
          results={results}
          streaming={streaming}
          createdAt={data.latestRun?.createdAt ?? data.recording.createdAt}
        />
      );
    case "jira":
      return (
        <JiraLinkPane
          results={results}
          streaming={streaming}
          createdAt={data.latestRun?.createdAt ?? data.recording.createdAt}
        />
      );
    case "confluence":
      return (
        <ConfluenceLinkPane
          results={results}
          streaming={streaming}
          createdAt={data.latestRun?.createdAt ?? data.recording.createdAt}
        />
      );
  }
};

export default ArtifactReadingRouter;
