import type { CaptureIllustrationDefinition } from "@/types/illustration";

/**
 * Capture-flow illustration placeholders (Batch 1).
 * Pipeline stage illustrations live in components/illustrations/pipeline/.
 */
export const CAPTURE_ILLUSTRATIONS: Record<
  CaptureIllustrationDefinition["id"],
  CaptureIllustrationDefinition
> = {
  "home-idle": {
    id: "home-idle",
    posterSrc: "/illustrations/home-idle.svg",
    aspectRatio: 1,
    alt: "Tap the microphone to record your idea",
    contexts: ["IdleScreen"],
  },
  "recording-active": {
    id: "recording-active",
    posterSrc: "/illustrations/recording-active.svg",
    aspectRatio: 1,
    alt: "Recording in progress",
    contexts: ["RecordingScreen"],
  },
  handoff: {
    id: "handoff",
    posterSrc: "/illustrations/handoff.svg",
    aspectRatio: 4 / 3,
    alt: "Sending your idea",
    contexts: ["HandoffScreen"],
  },
  "transcript-review": {
    id: "transcript-review",
    posterSrc: "/illustrations/transcript-review.svg",
    aspectRatio: 16 / 9,
    alt: "Your transcribed idea",
    contexts: ["TranscriptionScreen"],
  },
};

export const getCaptureIllustration = (
  id: CaptureIllustrationDefinition["id"]
) => CAPTURE_ILLUSTRATIONS[id];
