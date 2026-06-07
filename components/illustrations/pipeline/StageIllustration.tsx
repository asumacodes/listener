"use client";

import BuildingBoardIllustration from "@/components/illustrations/pipeline/BuildingBoardIllustration";
import DesigningBrandIllustration from "@/components/illustrations/pipeline/DesigningBrandIllustration";
import RehydrationIllustration from "@/components/illustrations/pipeline/RehydrationIllustration";
import ResearchingIllustration from "@/components/illustrations/pipeline/ResearchingIllustration";
import TranscribingIllustration from "@/components/illustrations/pipeline/TranscribingIllustration";
import WritingPrdIllustration from "@/components/illustrations/pipeline/WritingPrdIllustration";
import { stageIllustrationId } from "@/lib/pipeline/stage-copy";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { PipelineStage } from "@/types/pipeline";

type StageIllustrationProps = PipelineIllustrationProps & {
  stage: PipelineStage | null;
};

const StageIllustration = ({ stage, ...props }: StageIllustrationProps) => {
  const id = stageIllustrationId(stage);

  switch (id) {
    case "stage-transcribing":
      return <TranscribingIllustration {...props} />;
    case "stage-researching":
      return <ResearchingIllustration {...props} />;
    case "stage-writing-prd":
      return <WritingPrdIllustration {...props} />;
    case "stage-designing-brand":
      return <DesigningBrandIllustration {...props} />;
    case "stage-building-board":
      return <BuildingBoardIllustration {...props} />;
    default:
      return <TranscribingIllustration {...props} />;
  }
};

export { RehydrationIllustration, StageIllustration };
export default StageIllustration;
