import type {
  BrandContent,
  CompetitorRow,
  EngineeringSection,
  LinkOutContent,
  PipelineCardContent,
  PipelineCardId,
  PrdSection,
  RoadmapPhase,
} from "@/types/pipeline-ui";
import type { PipelineStage } from "@/types/pipeline";

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

const MOCK_TRANSCRIPT =
  "A weekly grocery box sized for people who live alone — less waste, fewer decisions. You pick a few staples once, it adapts to what you actually finish, and it learns over time.";

const MOCK_COMPETITORS: CompetitorRow[] = [
  {
    name: "HelloFresh",
    note: "Meal kits at household scale — weak on single portions.",
  },
  {
    name: "Imperfect Foods",
    note: "Waste-focused grocery, but no personalization loop.",
  },
  {
    name: "Misfits Market",
    note: "Discount produce boxes with fixed sizing.",
  },
];

const MOCK_PRD: PrdSection[] = [
  {
    heading: "Problem",
    body: "Grocery is built for households of four. Solo shoppers over-buy and waste, or under-buy and order out.",
  },
  {
    heading: "Solution",
    body: "An adaptive weekly box that learns what one person actually finishes and right-sizes itself.",
  },
  {
    heading: "Key features",
    body: "Staple setup · adaptive sizing · waste feedback · flat weekly price.",
  },
  {
    heading: "Success metric",
    body: "Share of box consumed, and 8-week retention.",
  },
];

const MOCK_BRAND: BrandContent = {
  direction:
    "Warm, calm, practical — a kitchen that quietly takes care of itself.",
  palette: ["#3E5641", "#8FA88F", "#F3EEE3", "#D98E5A", "#2A2A28"],
  type: "Tiempos display · Söhne text",
};

const MOCK_ENGINEERING: EngineeringSection[] = [
  { heading: "Stack", body: "Next.js · Supabase · Stripe" },
  {
    heading: "Core systems",
    body: "Adaptation engine · sourcing & inventory · subscription billing",
  },
  { heading: "First milestone", body: "~6 weeks to a working MVP" },
];

const MOCK_ROADMAP: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    weeks: "Weeks 1–2",
    body: "Staple setup + fixed first box",
  },
  {
    phase: "Phase 2",
    weeks: "Weeks 3–4",
    body: "Consumption feedback loop",
  },
  { phase: "Phase 3", weeks: "Weeks 5–6", body: "Adaptive right-sizing" },
];

const MOCK_JIRA: LinkOutContent = {
  meta: "12 issues · 3 epics",
  cta: "View in Jira",
  href: null,
};

const MOCK_CONFLUENCE: LinkOutContent = {
  meta: "PRD + brand space",
  cta: "View in Confluence",
  href: null,
};

export const getMockCardContent = (
  id: PipelineCardId,
  transcription: string
): PipelineCardContent => {
  switch (id) {
    case "transcript":
      return {
        id: "transcript",
        text: transcription.trim() || MOCK_TRANSCRIPT,
      };
    case "competitor":
      return { id: "competitor", rows: MOCK_COMPETITORS };
    case "prd":
      return { id: "prd", sections: MOCK_PRD };
    case "brand":
      return { id: "brand", brand: MOCK_BRAND };
    case "engineering":
      return { id: "engineering", sections: MOCK_ENGINEERING };
    case "roadmap":
      return { id: "roadmap", phases: MOCK_ROADMAP };
    case "jira":
      return { id: "jira", link: MOCK_JIRA };
    case "confluence":
      return { id: "confluence", link: MOCK_CONFLUENCE };
  }
};
