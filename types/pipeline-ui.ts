import type { HandoffReason, PipelineStage } from "@/types/pipeline";

export type PipelineRunVariant = "running" | "complete" | "failed";

export type PipelineCardId =
  | "transcript"
  | "competitor"
  | "prd"
  | "brand"
  | "engineering"
  | "roadmap"
  | "jira"
  | "confluence";

export type PipelineCardState =
  | "pending"
  | "loading"
  | "populated"
  | "empty"
  | "failed";

export type PipelineCardKind = "inapp" | "linkout";

export type CompetitorRow = {
  name: string;
  note: string;
  positioning?: string;
  strengths?: string[];
  weaknesses?: string[];
  pricingModel?: string;
  url?: string;
};

export type PrdSection = {
  heading: string;
  body: string;
  items?: { title: string; description?: string }[];
};

export type EngineeringSection = {
  heading: string;
  body: string;
};

export type RoadmapPhase = {
  phase: string;
  weeks: string;
  body: string;
};

export type BrandContent = {
  direction: string;
  palette: string[];
  type: string;
  tagline?: string;
  values?: string[];
};

export type LinkOutContent = {
  meta: string;
  cta: string;
  href: string | null;
};

export type PipelineCardContent =
  | { id: "transcript"; text: string }
  | { id: "competitor"; rows: CompetitorRow[] }
  | { id: "prd"; sections: PrdSection[] }
  | { id: "brand"; brand: BrandContent }
  | { id: "engineering"; sections: EngineeringSection[] }
  | { id: "roadmap"; phases: RoadmapPhase[] }
  | { id: "jira"; link: LinkOutContent }
  | { id: "confluence"; link: LinkOutContent };

export type PipelineUiState = {
  title: string;
  showExpiryBanner: boolean;
  showLongerHint: boolean;
  feed: PipelineCardId[];
  cardStates: Record<PipelineCardId, PipelineCardState>;
  activeLoadingCard: PipelineCardId | null;
  activeLoadingStage: PipelineStage | null;
  failedStage: PipelineStage | null;
};

export type DerivePipelineUiArgs = {
  variant: PipelineRunVariant;
  pipelineStage: PipelineStage | null;
  transcription: string;
  showExpiryBanner?: boolean;
  showLongerHint?: boolean;
  handoffReason?: HandoffReason | null;
};
