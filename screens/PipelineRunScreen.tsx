"use client";

import PipelineAddToProjectCard from "@/components/pipeline/run/PipelineAddToProjectCard";
import PipelineCardFeed from "@/components/pipeline/run/PipelineCardFeed";
import FlowWordmarkHeader from "@/components/layout/FlowWordmarkHeader";
import ProjectSheet from "@/components/projects/ProjectSheet";
import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";
import { IconCheck } from "@/components/icons/ListenerIcons";
import useProjectPicker from "@/hooks/useProjectPicker";
import { copy } from "@/lib/design/copy";
import { derivePipelineUiState } from "@/lib/pipeline/derive-ui-state";
import { ui } from "@/lib/design/ui";
import { flowScreenClass, shellPaddingX } from "@/lib/layout/shell";
import type { PipelineRunVariant } from "@/types/pipeline-ui";
import type { HandoffReason, PipelineStage } from "@/types/pipeline";
import type { RunResults } from "@/types/run-results";
import Link from "next/link";
import { useState } from "react";

type PipelineRunScreenProps = {
  variant: PipelineRunVariant;
  pipelineStage: PipelineStage | null;
  transcription: string;
  runResults: RunResults | null;
  runId: string | null;
  recordingId?: string | null;
  currentProjectId?: string | null;
  showExpiryBanner?: boolean;
  showLongerHint?: boolean;
  handoffReason?: HandoffReason | null;
  onWatchdogRefresh?: () => void;
  onRetry?: () => void | Promise<void>;
  onNewRecording?: () => void;
  onProjectAssigned?: (projectId: string, isDefault: boolean) => void;
};

const PipelineSuccessTitle = ({ title }: { title: string }) => (
  <h1 className="mt-5 inline-flex items-center justify-center gap-2.5 font-serif text-[30px] leading-[1.12] tracking-[-0.01em] text-gold">
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-white shadow-[0_0_0_4px_#C9A96E26]"
      aria-hidden
    >
      <IconCheck size={18} strokeWidth={2.2} />
    </span>
    {title}
  </h1>
);

const PipelineRunScreen = ({
  variant,
  pipelineStage,
  transcription,
  runResults,
  runId,
  recordingId,
  currentProjectId = null,
  showExpiryBanner = false,
  showLongerHint = false,
  handoffReason = null,
  onWatchdogRefresh,
  onRetry,
  onNewRecording,
  onProjectAssigned,
}: PipelineRunScreenProps) => {
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const isComplete = variant === "complete";

  const picker = useProjectPicker({
    recordingId: recordingId ?? "",
    currentProjectId,
    enabled: isComplete && Boolean(recordingId),
    onAssigned: onProjectAssigned,
  });

  const uiState = derivePipelineUiState({
    variant,
    pipelineStage,
    transcription,
    showExpiryBanner: isComplete && showExpiryBanner,
    showLongerHint,
    handoffReason,
  });

  return (
    <div className={`${flowScreenClass} animate-fade-in`}>
      <div className={`${shellPaddingX} shrink-0 pt-2 text-center`}>
        <FlowWordmarkHeader />
        {isComplete ? (
          <PipelineSuccessTitle title={uiState.title} />
        ) : (
          <h1 className={`${ui.flowTitle} mt-5`}>{uiState.title}</h1>
        )}
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto scrollbar-hide ${shellPaddingX} pb-6 pt-5`}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-3.5">
          {isComplete && recordingId ? (
            <>
              <PipelineAddToProjectCard
                onClick={() => setProjectSheetOpen(true)}
                disabled={picker.isSaving}
              />
              {picker.savedTo ? (
                <p className="-mt-1 text-center text-xs text-text-secondary">
                  Saved to {picker.savedTo}
                </p>
              ) : null}
              {picker.error ? (
                <p className="-mt-1 text-center text-xs text-red">
                  {picker.error}
                </p>
              ) : null}
            </>
          ) : null}
          <PipelineCardFeed
            uiState={uiState}
            transcription={transcription}
            runResults={runResults}
            onRetry={onRetry}
            onRefresh={onWatchdogRefresh}
          />
        </div>
      </div>

      {isComplete ? (
        <CtaBar>
          {onNewRecording ? (
            <Button
              variant="secondary"
              className="shrink-0 whitespace-nowrap"
              onClick={onNewRecording}
            >
              {copy.pipeline.newRecording}
            </Button>
          ) : null}

          {recordingId ? (
            <Link
              href={`/ideas/${recordingId}`}
              className="block min-w-0 flex-1"
            >
              <Button fullWidth>{copy.pipeline.viewResults}</Button>
            </Link>
          ) : runId ? (
            <Link href={`/runs/${runId}`} className="block min-w-0 flex-1">
              <Button fullWidth>{copy.pipeline.viewResults}</Button>
            </Link>
          ) : (
            <Link href="/projects" className="block min-w-0 flex-1">
              <Button fullWidth>{copy.pipeline.goToProjects}</Button>
            </Link>
          )}
        </CtaBar>
      ) : null}

      {variant === "failed" && (
        <CtaBar>
          {onNewRecording ? (
            <Button variant="secondary" fullWidth onClick={onNewRecording}>
              {copy.pipeline.newRecording}
            </Button>
          ) : null}

          {onRetry ? (
            <Button
              variant="retry"
              fullWidth
              onClick={onRetry}
              disabled={!runId}
            >
              {copy.pipeline.tryAgain}
            </Button>
          ) : null}
        </CtaBar>
      )}

      {isComplete && recordingId ? (
        <ProjectSheet
          open={projectSheetOpen || picker.createSheetOpen}
          onClose={() => {
            setProjectSheetOpen(false);
            picker.onCloseCreateSheet();
          }}
          projects={picker.projects}
          onSelect={(id) => {
            void picker.onSelect(id);
            setProjectSheetOpen(false);
          }}
          onCreateAndAssign={picker.onCreateAndAssign}
          initialCreate={picker.createSheetOpen}
          suggestedName={null}
        />
      ) : null}
    </div>
  );
};

export default PipelineRunScreen;
