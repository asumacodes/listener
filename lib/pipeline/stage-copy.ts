import type { PipelineStage } from "@/types/pipeline";
import type {
  PipelineIllustrationId,
  PipelineStageMeta,
} from "@/types/illustration";

export const PIPELINE_STAGE_ORDER: PipelineStage[] = [
  "transcribing",
  "researching",
  "writing_prd",
  "designing_brand",
  "building_board",
];

const STAGE_META: Record<
  PipelineStage,
  Omit<PipelineStageMeta, "stage" | "index" | "total">
> = {
  transcribing: {
    title: "Transcribing",
    subtitle: "Turning your voice into words.",
    illustrationId: "stage-transcribing",
  },
  researching: {
    title: "Researching the market",
    subtitle: "Scanning the landscape for signal.",
    illustrationId: "stage-researching",
  },
  writing_prd: {
    title: "Writing the PRD",
    subtitle: "Structuring the document.",
    illustrationId: "stage-writing-prd",
  },
  designing_brand: {
    title: "Designing the brand",
    subtitle: "Settling the palette and type.",
    illustrationId: "stage-designing-brand",
  },
  building_board: {
    title: "Building your board",
    subtitle: "Assembling your workspace.",
    illustrationId: "stage-building-board",
  },
};

export const getStageMeta = (
  stage: PipelineStage | null
): PipelineStageMeta => {
  const resolved = stage ?? "transcribing";
  const index = PIPELINE_STAGE_ORDER.indexOf(resolved);
  const meta = STAGE_META[resolved];
  return {
    stage: resolved,
    index: index + 1,
    total: PIPELINE_STAGE_ORDER.length,
    ...meta,
  };
};

export const stageIllustrationId = (
  stage: PipelineStage | null
): PipelineIllustrationId => getStageMeta(stage).illustrationId;

export const stageEyebrow = (stage: PipelineStage | null): string => {
  const { index, total } = getStageMeta(stage);
  return `Stage ${index} of ${total}`;
};
