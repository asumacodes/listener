import type { PipelineStage } from "./pipeline";

/** Capture-flow illustration slots (Batch 1). */
export type CaptureIllustrationId =
  | "home-idle"
  | "recording-active"
  | "handoff"
  | "transcript-review";

/** Pipeline loading illustrations (Design System ill-1 … ill-6). */
export type PipelineIllustrationId =
  | "stage-transcribing"
  | "stage-researching"
  | "stage-writing-prd"
  | "stage-designing-brand"
  | "stage-building-board"
  | "rehydration-splash";

export type IllustrationId = CaptureIllustrationId | PipelineIllustrationId;

export type PipelineIllustrationProps = {
  size?: number;
  animated?: boolean;
  className?: string;
  /** Densified marks for desktop reading pane (240px). Default mobile. */
  scale?: "mobile" | "desktop";
};

export type PipelineStageMeta = {
  stage: PipelineStage;
  index: number;
  total: number;
  title: string;
  subtitle: string;
  illustrationId: PipelineIllustrationId;
};

export type CaptureIllustrationDefinition = {
  id: CaptureIllustrationId;
  /** Public path to Lottie JSON when capture-flow art ships. */
  lottieSrc?: string;
  posterSrc: string;
  aspectRatio: number;
  alt: string;
  contexts: string[];
};
