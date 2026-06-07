import type { M1CardId } from "@/types/ideas";

export type M1CardMeta = {
  id: M1CardId;
  title: string;
  stageLabel: string;
  emptyCopy?: string;
};

export const M1_CARD_ORDER: M1CardId[] = [
  "transcript",
  "competitor",
  "prd",
  "brand",
  "engineering",
  "roadmap",
  "jira",
  "confluence",
];

export const M1_CARDS: Record<M1CardId, M1CardMeta> = {
  transcript: {
    id: "transcript",
    title: "Transcript",
    stageLabel: "Transcript",
  },
  competitor: {
    id: "competitor",
    title: "Competitor map",
    stageLabel: "Research",
    emptyCopy: "Not enough market signal to map competitors for this idea.",
  },
  prd: { id: "prd", title: "PRD", stageLabel: "PRD" },
  brand: { id: "brand", title: "Brand kit", stageLabel: "Brand" },
  engineering: {
    id: "engineering",
    title: "Engineering brief",
    stageLabel: "Board",
  },
  roadmap: { id: "roadmap", title: "Roadmap", stageLabel: "Board" },
  jira: { id: "jira", title: "Jira", stageLabel: "Board", emptyCopy: "Link" },
  confluence: {
    id: "confluence",
    title: "Confluence",
    stageLabel: "Board",
    emptyCopy: "Link",
  },
};

export const M1_STAGE_ORDER = [
  "transcribe",
  "research",
  "prd",
  "brand",
  "board",
] as const;

export type M1StageId = (typeof M1_STAGE_ORDER)[number];

export const M1_STAGE_LABELS: Record<M1StageId, string> = {
  transcribe: "Transcript",
  research: "Research",
  prd: "PRD",
  brand: "Brand",
  board: "Board",
};
