// hooks/useMurmurActions.ts
//
// Murmur pipeline user-actions (KAN-32 Phase 3). Mirrors useRecordingActions:
// takes the screen-state bag, drives transitions via setAppState. Orchestration
// in the hook; no signing/IO here (that's the route handlers + lib/murmur/*).

"use client";

import { useCallback } from "react";
import {
  isHandoffReason,
  resumePipelineRun,
  retryPipelineRun,
  startPipelineRun,
} from "@/lib/murmur/client";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import type { HandoffReason } from "@/types/pipeline";

type MurmurActions = {
  kickoffPipeline: (recordingId: string) => Promise<void>;
  retryHandoff: () => Promise<void>;
  retryPipeline: () => Promise<void>;
  resumePipeline: (resumeRunId: string) => Promise<void>;
};

const toHandoffReason = (
  reason: string | undefined,
  fallback: HandoffReason = "bad_response"
): HandoffReason => (isHandoffReason(reason) ? reason : fallback);

export function useMurmurActions(state: RecordingScreenState): MurmurActions {
  const {
    runId,
    savedRecordingId,
    setRunId,
    setAppState,
    setPipelineStage,
    setRunResults,
    setHandoffReason,
    setPipelineError,
    setConcurrentActiveRunId,
    setOutOfQuotaOpen,
    setCostHaltOpen,
  } = state;

  const promptConcurrentRun = useCallback(
    (activeRunId: string) => {
      setConcurrentActiveRunId(activeRunId);
      setRunId(null);
      setHandoffReason(null);
      setPipelineError(null);
      // Return to the surface they kicked off from (transcript), not a failed
      // pipeline for a run that never started.
      setAppState(savedRecordingId ? AppState.DONE : AppState.IDLE);
    },
    [
      savedRecordingId,
      setConcurrentActiveRunId,
      setRunId,
      setHandoffReason,
      setPipelineError,
      setAppState,
    ]
  );

  const promptOutOfQuota = useCallback(() => {
    setOutOfQuotaOpen(true);
    setRunId(null);
    setHandoffReason(null);
    setPipelineError(null);
    // Same restore as concurrent-run: stay on transcript/idle, not a failed
    // pipeline for a kickoff that never started.
    setAppState(savedRecordingId ? AppState.DONE : AppState.IDLE);
  }, [
    savedRecordingId,
    setOutOfQuotaOpen,
    setRunId,
    setHandoffReason,
    setPipelineError,
    setAppState,
  ]);

  const promptCostHalt = useCallback(() => {
    setCostHaltOpen(true);
    setRunId(null);
    setHandoffReason(null);
    setPipelineError(null);
    setAppState(savedRecordingId ? AppState.DONE : AppState.IDLE);
  }, [
    savedRecordingId,
    setCostHaltOpen,
    setRunId,
    setHandoffReason,
    setPipelineError,
    setAppState,
  ]);

  const kickoffPipeline = useCallback(
    async (recordingId: string) => {
      setHandoffReason(null);
      setPipelineError(null);
      setPipelineStage(null);
      setRunResults(null);
      setAppState(AppState.SUBMITTING);

      const result = await startPipelineRun(recordingId);
      if (result.ok) {
        setRunId(result.runId);
        setAppState(AppState.PIPELINE_RUNNING);
        return;
      }

      if (
        result.reason === "run_in_progress" &&
        "activeRunId" in result &&
        typeof result.activeRunId === "string"
      ) {
        promptConcurrentRun(result.activeRunId);
        return;
      }

      if (result.reason === "out_of_quota") {
        promptOutOfQuota();
        return;
      }

      if (result.reason === "cost_halt") {
        promptCostHalt();
        return;
      }

      // Handoff failed before the Bridge accepted live work. Keep this out of
      // live recovery, otherwise a stale queued row can rehydrate as running.
      setRunId(null);
      setHandoffReason(toHandoffReason(result.reason, "create_failed"));
      setAppState(AppState.PIPELINE_FAILED);
    },
    [
      setRunId,
      setAppState,
      setPipelineStage,
      setRunResults,
      setHandoffReason,
      setPipelineError,
      promptConcurrentRun,
      promptOutOfQuota,
      promptCostHalt,
    ]
  );

  const retryPipeline = useCallback(async () => {
    if (!savedRecordingId) {
      setRunId(null);
      setHandoffReason("create_failed");
      setAppState(AppState.PIPELINE_FAILED);
      return;
    }

    await kickoffPipeline(savedRecordingId);
  }, [
    savedRecordingId,
    kickoffPipeline,
    setRunId,
    setHandoffReason,
    setAppState,
  ]);

  const resumePipeline = useCallback(
    async (resumeRunId: string) => {
      setHandoffReason(null);
      setPipelineError(null);
      setRunResults(null);
      setAppState(AppState.SUBMITTING);

      const result = await resumePipelineRun(resumeRunId);
      if (result.ok) {
        setRunId(result.runId);
        setAppState(AppState.PIPELINE_RUNNING);
        return;
      }

      if (
        result.reason === "run_in_progress" &&
        "activeRunId" in result &&
        typeof result.activeRunId === "string"
      ) {
        promptConcurrentRun(result.activeRunId);
        return;
      }

      // not_resumable / any resume failure → fall back to a fresh run when possible.
      if (savedRecordingId) {
        await kickoffPipeline(savedRecordingId);
        return;
      }

      setRunId(null);
      setHandoffReason(toHandoffReason(result.reason, "create_failed"));
      setAppState(AppState.PIPELINE_FAILED);
    },
    [
      savedRecordingId,
      kickoffPipeline,
      setRunId,
      setAppState,
      setRunResults,
      setHandoffReason,
      setPipelineError,
      promptConcurrentRun,
    ]
  );

  const retryHandoff = useCallback(async () => {
    if (!runId) {
      setHandoffReason("create_failed");
      setAppState(AppState.PIPELINE_FAILED);
      return;
    }

    setHandoffReason(null);
    setPipelineError(null);
    setRunResults(null);

    const result = await retryPipelineRun(runId);
    if (result.ok) {
      setAppState(AppState.PIPELINE_RUNNING);
      return;
    }

    // Failed handoff retries are not active live runs anymore.
    setRunId(null);
    setHandoffReason(toHandoffReason(result.reason, "not_retryable"));
    setAppState(AppState.PIPELINE_FAILED);
  }, [
    runId,
    setRunId,
    setAppState,
    setHandoffReason,
    setPipelineError,
    setRunResults,
  ]);

  return { kickoffPipeline, retryHandoff, retryPipeline, resumePipeline };
}

export default useMurmurActions;
