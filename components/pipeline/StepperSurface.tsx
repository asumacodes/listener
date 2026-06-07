"use client";

import "@/components/illustrations/pipeline/illustration-motion.css";

import StageIllustration from "@/components/illustrations/pipeline/StageIllustration";

import LoadingStateCard from "@/components/pipeline/LoadingStateCard";

import ProgressTrack from "@/components/pipeline/ProgressTrack";

import StageDots from "@/components/pipeline/StageDots";

import Button from "@/components/ui/Button";

import CtaBar from "@/components/ui/CtaBar";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

import { copy } from "@/lib/design/copy";

import { ui } from "@/lib/design/ui";

import { getStageMeta, stageEyebrow } from "@/lib/pipeline/stage-copy";

import type { HandoffReason } from "@/types/pipeline";

import type { PipelineStage } from "@/types/pipeline";

import Link from "next/link";

export type StepperVariant = "running" | "complete" | "failed";

type StepperSurfaceProps = {
  variant: StepperVariant;

  pipelineStage: PipelineStage | null;

  runId: string | null;

  recordingId?: string | null;

  handoffReason?: HandoffReason | null;

  pipelineError?: string | null;

  onRetry?: () => void;

  onNewRecording?: () => void;
};

const reasonCopy: Partial<Record<HandoffReason, string>> = {
  invalid_signature: "Bridge rejected the signature. Check server secrets.",

  minutes_exhausted: "Free-tier minutes are exhausted.",

  bad_response: "Bridge returned an unexpected response.",

  unreachable: "Could not reach the Bridge webhook.",

  create_failed: "Could not create the pipeline run row.",

  handoff_failed: "Handoff to Bridge failed. You can retry.",

  not_retryable: "This run is no longer retryable.",

  recording_unavailable: "Could not load the recording audio.",
};

const StepperSurface = ({
  variant,

  pipelineStage,

  runId,

  recordingId,

  handoffReason,

  pipelineError,

  onRetry,

  onNewRecording,
}: StepperSurfaceProps) => {
  const reduceMotion = usePrefersReducedMotion();

  const animated = !reduceMotion;

  const illustrationStage =
    variant === "complete" ? "building_board" : pipelineStage;

  const meta = getStageMeta(illustrationStage);

  const failureMessage =
    pipelineError ??
    (handoffReason ? reasonCopy[handoffReason] : undefined) ??
    "Something went wrong.";

  let eyebrow: React.ReactNode;

  let title: React.ReactNode;

  let subtitle: React.ReactNode | undefined;

  let footer: React.ReactNode;

  if (variant === "running") {
    eyebrow = (
      <p className={`${ui.eyebrow} text-gold-deep`}>
        {stageEyebrow(pipelineStage)}
      </p>
    );

    title = meta.title;

    subtitle = meta.subtitle;

    footer = (
      <>
        <div className="flex justify-center">
          <ProgressTrack shimmer={animated} />
        </div>

        <StageDots activeStage={pipelineStage} />
      </>
    );
  } else if (variant === "complete") {
    eyebrow = <p className={`${ui.eyebrow} text-gold-deep`}>Complete</p>;

    title = copy.success.ideaReady;

    subtitle = "Your voice note has been processed.";

    footer = <StageDots activeStage="building_board" />;
  } else {
    eyebrow = <p className={`${ui.eyebrow} text-red`}>Needs attention</p>;

    title = copy.stepper.failed;

    subtitle = failureMessage;

    footer = runId ? (
      <p className="mt-3 text-[11px] tracking-wide text-muted uppercase">
        Run {runId.slice(0, 8)}
      </p>
    ) : null;
  }

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-[max(1.25rem,env(safe-area-inset-left))]">
        <div key={meta.illustrationId} className="ill-crossfade w-full">
          <LoadingStateCard
            illustration={
              <StageIllustration
                stage={illustrationStage}
                size={150}
                animated={animated && variant === "running"}
              />
            }
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            footer={footer}
          />
        </div>
      </div>

      {variant === "complete" && (
        <CtaBar className="px-[max(1.25rem,env(safe-area-inset-left))]">
          {recordingId ? (
            <Link
              href={`/ideas/${recordingId}`}
              className="block w-full flex-1"
            >
              <Button fullWidth>View results</Button>
            </Link>
          ) : runId ? (
            <Link href={`/runs/${runId}`} className="block w-full flex-1">
              <Button fullWidth>View results</Button>
            </Link>
          ) : (
            <Link href="/projects" className="block w-full flex-1">
              <Button fullWidth>Go to projects</Button>
            </Link>
          )}

          {onNewRecording && (
            <Button variant="secondary" fullWidth onClick={onNewRecording}>
              New recording
            </Button>
          )}
        </CtaBar>
      )}

      {variant === "failed" && (
        <CtaBar className="px-[max(1.25rem,env(safe-area-inset-left))]">
          {onNewRecording && (
            <Button variant="secondary" fullWidth onClick={onNewRecording}>
              New recording
            </Button>
          )}

          {onRetry && (
            <Button fullWidth onClick={onRetry} disabled={!runId}>
              Try again
            </Button>
          )}
        </CtaBar>
      )}
    </div>
  );
};

export default StepperSurface;
