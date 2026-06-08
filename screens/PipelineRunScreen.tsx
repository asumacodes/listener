"use client";

import PipelineCardFeed from "@/components/pipeline/run/PipelineCardFeed";
import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";
import { derivePipelineUiState } from "@/lib/pipeline/derive-ui-state";
import { ui } from "@/lib/design/ui";
import { flowScreenClass, shellPaddingX } from "@/lib/layout/shell";
import type { PipelineRunVariant } from "@/types/pipeline-ui";
import type { PipelineStage } from "@/types/pipeline";
import Link from "next/link";

type PipelineRunScreenProps = {
  variant: PipelineRunVariant;
  pipelineStage: PipelineStage | null;
  transcription: string;
  runId: string | null;
  recordingId?: string | null;
  showExpiryBanner?: boolean;
  onRetry?: () => void;
  onNewRecording?: () => void;
};

const PipelineRunScreen = ({
  variant,
  pipelineStage,
  transcription,
  runId,
  recordingId,
  showExpiryBanner = false,
  onRetry,
  onNewRecording,
}: PipelineRunScreenProps) => {
  const uiState = derivePipelineUiState({
    variant,
    pipelineStage,
    transcription,
    showExpiryBanner: variant === "complete" && showExpiryBanner,
  });

  return (
    <div className={`${flowScreenClass} animate-fade-in`}>
      <div className={`${shellPaddingX} shrink-0 pt-2`}>
        <FlowWordmarkHeader />
        <h1 className={`${ui.flowTitle} mt-[60px]`}>{uiState.title}</h1>
      </div>

      <div
        className={`flex-1 overflow-y-auto ${shellPaddingX} pb-6 pt-5`}
        tabIndex={-1}
      >
        <PipelineCardFeed
          uiState={uiState}
          transcription={transcription}
          onRetry={onRetry}
        />
      </div>

      {variant === "complete" && (
        <CtaBar>
          {onNewRecording ? (
            <Button
              variant="secondary"
              className="shrink-0 whitespace-nowrap"
              onClick={onNewRecording}
            >
              New recording
            </Button>
          ) : null}

          {recordingId ? (
            <Link
              href={`/ideas/${recordingId}`}
              className="block min-w-0 flex-1"
            >
              <Button fullWidth className="whitespace-nowrap">
                View results
              </Button>
            </Link>
          ) : runId ? (
            <Link href={`/runs/${runId}`} className="block min-w-0 flex-1">
              <Button fullWidth className="whitespace-nowrap">
                View results
              </Button>
            </Link>
          ) : (
            <Link href="/projects" className="block min-w-0 flex-1">
              <Button fullWidth className="whitespace-nowrap">
                Go to projects
              </Button>
            </Link>
          )}
        </CtaBar>
      )}

      {variant === "failed" && (
        <CtaBar>
          {onNewRecording ? (
            <Button variant="secondary" fullWidth onClick={onNewRecording}>
              New recording
            </Button>
          ) : null}

          {onRetry ? (
            <Button fullWidth onClick={onRetry} disabled={!runId}>
              Try again
            </Button>
          ) : null}
        </CtaBar>
      )}
    </div>
  );
};

export default PipelineRunScreen;
