import type { PipelineStage } from "@/types/pipeline";
import type { PipelineCardId } from "@/types/pipeline-ui";

export const PIPELINE_CARD_ORDER: PipelineCardId[] = [
  "transcript",
  "competitor",
  "prd",
  "brand",
  "engineering",
  "roadmap",
  "jira",
  "confluence",
];

export const STAGE_CARD_MAP: Record<
  Exclude<PipelineStage, "transcribing">,
  PipelineCardId[]
> = {
  researching: ["competitor"],
  writing_prd: ["prd"],
  designing_brand: ["brand"],
  building_board: ["engineering", "roadmap", "jira", "confluence"],
};

/** Loading representative when a multi-card stage is active. */
export const STAGE_LOADING_CARD: Record<
  Exclude<PipelineStage, "transcribing">,
  PipelineCardId
> = {
  researching: "competitor",
  writing_prd: "prd",
  designing_brand: "brand",
  building_board: "engineering",
};

export const PIPELINE_CARD_META: Record<
  PipelineCardId,
  { title: string; kind: "inapp" | "linkout" }
> = {
  transcript: { title: "Transcript", kind: "inapp" },
  competitor: { title: "Competitors", kind: "inapp" },
  prd: { title: "PRD", kind: "inapp" },
  brand: { title: "Brand", kind: "inapp" },
  engineering: { title: "Engineering", kind: "inapp" },
  roadmap: { title: "Roadmap", kind: "inapp" },
  jira: { title: "Jira board", kind: "linkout" },
  confluence: { title: "Confluence", kind: "linkout" },
};
