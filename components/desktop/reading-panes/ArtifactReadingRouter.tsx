"use client";

import BrandKitPane from "@/components/desktop/reading-panes/BrandKitPane";
import CompetitorMapPane from "@/components/desktop/reading-panes/CompetitorMapPane";
import EngineeringBriefPane from "@/components/desktop/reading-panes/EngineeringBriefPane";
import {
  ConfluenceLinkPane,
  JiraLinkPane,
  RoadmapLinkPane,
} from "@/components/desktop/reading-panes/LinkOutPanes";
import PrdPane from "@/components/desktop/reading-panes/PrdPane";
import TranscriptPane from "@/components/desktop/reading-panes/TranscriptPane";
import type { IdeaDetailData, M1CardId } from "@/types/ideas";

type ArtifactReadingRouterProps = {
  selected: M1CardId;
  data: IdeaDetailData;
  streaming?: boolean;
  canKickoff?: boolean;
};

const ArtifactReadingRouter = ({
  selected,
  data,
  streaming = false,
  canKickoff = true,
}: ArtifactReadingRouterProps) => {
  const results = data.latestRunResults;

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
      return <RoadmapLinkPane results={results} streaming={streaming} />;
    case "jira":
      return <JiraLinkPane results={results} streaming={streaming} />;
    case "confluence":
      return <ConfluenceLinkPane results={results} streaming={streaming} />;
  }
};

export default ArtifactReadingRouter;
