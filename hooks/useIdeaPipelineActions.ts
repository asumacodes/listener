"use client";

import { resumePipelineRun, startPipelineRun } from "@/lib/murmur/client";
import type { IdeaRunSummary } from "@/types/ideas";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type PipelineStartResult = Awaited<ReturnType<typeof startPipelineRun>>;
type PipelineResumeResult = Awaited<ReturnType<typeof resumePipelineRun>>;

type UseIdeaPipelineActionsArgs = {
  recordingId: string;
  latestRun: IdeaRunSummary | null;
  canKickoff?: boolean;
  /** Called when a new run starts (success path) so live UI can subscribe. */
  onRunStarted?: (runId: string) => void;
};

/**
 * Shared kickoff / resume / re-run actions for desktop idea header + failed pane.
 * Mirrors mobile IdeaDetailView.handleRetry (resume if resumable, else start).
 */
export function useIdeaPipelineActions({
  recordingId,
  latestRun,
  canKickoff = true,
  onRunStarted,
}: UseIdeaPipelineActionsArgs) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [concurrentActiveRunId, setConcurrentActiveRunId] = useState<
    string | null
  >(null);
  const [outOfQuotaOpen, setOutOfQuotaOpen] = useState(false);
  const [costHaltOpen, setCostHaltOpen] = useState(false);

  const applyPipelineResult = useCallback(
    (result: PipelineStartResult | PipelineResumeResult): void => {
      if (result.ok) {
        onRunStarted?.(result.runId);
        router.refresh();
        return;
      }
      if (
        result.reason === "run_in_progress" &&
        "activeRunId" in result &&
        typeof result.activeRunId === "string"
      ) {
        setConcurrentActiveRunId(result.activeRunId);
        return;
      }
      if (result.reason === "out_of_quota") {
        setOutOfQuotaOpen(true);
        return;
      }
      if (result.reason === "cost_halt") {
        setCostHaltOpen(true);
      }
    },
    [onRunStarted, router]
  );

  const handleRunAgain = useCallback(async () => {
    if (!canKickoff) {
      setOutOfQuotaOpen(true);
      return;
    }
    setRerunning(true);
    try {
      applyPipelineResult(await startPipelineRun(recordingId));
    } finally {
      setRerunning(false);
    }
  }, [applyPipelineResult, canKickoff, recordingId]);

  // KAN-54: failed runs resume via /api/murmur/resume; fresh kickoff only when
  // not resumable or server returns not_resumable.
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const isResumable =
        latestRun?.status === "failed" && latestRun.currentStage != null;

      if (isResumable && latestRun) {
        const resumeResult = await resumePipelineRun(latestRun.id);
        if (resumeResult.ok) {
          onRunStarted?.(resumeResult.runId);
          router.refresh();
          return;
        }
        if (resumeResult.reason === "not_resumable") {
          applyPipelineResult(await startPipelineRun(recordingId));
          return;
        }
        applyPipelineResult(resumeResult);
        return;
      }

      applyPipelineResult(await startPipelineRun(recordingId));
    } finally {
      setRetrying(false);
    }
  }, [applyPipelineResult, latestRun, onRunStarted, recordingId, router]);

  return {
    retrying,
    rerunning,
    concurrentActiveRunId,
    setConcurrentActiveRunId,
    outOfQuotaOpen,
    setOutOfQuotaOpen,
    costHaltOpen,
    setCostHaltOpen,
    handleRetry,
    handleRunAgain,
  };
}

export default useIdeaPipelineActions;
