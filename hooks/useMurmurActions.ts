// hooks/useMurmurActions.ts
//
// Murmur pipeline user-actions (KAN-32 Phase 3). Mirrors useRecordingActions:
// takes the screen-state bag, drives transitions via setAppState. Orchestration
// in the hook; no signing/IO here (that's the route handlers + lib/murmur/*).

"use client";

import { useCallback } from "react";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import type { HandoffReason } from "@/types/pipeline";

type MurmurActions = {
  kickoffPipeline: (recordingId: string) => Promise<void>;
  retryHandoff: () => Promise<void>;
};

export function useMurmurActions(state: RecordingScreenState): MurmurActions {
  const {
    runId,
    setRunId,
    setAppState,
    setPipelineStage,
    setHandoffReason,
    setPipelineError,
  } = state;

  const kickoffPipeline = useCallback(
    async (recordingId: string) => {
      setHandoffReason(null);
      setPipelineError(null);
      setPipelineStage(null);
      setAppState(AppState.SUBMITTING);

      let res: Response;
      try {
        res = await fetch("/api/murmur/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordingId }),
        });
      } catch {
        setRunId(null);
        setHandoffReason("unreachable");
        setAppState(AppState.PIPELINE_FAILED);
        return;
      }

      const body = await res.json().catch(() => null);

      if (res.ok && body?.ok && body.status === "running") {
        setRunId(body.runId);
        setAppState(AppState.PIPELINE_RUNNING);
        return;
      }

      setRunId(body?.runId ?? null);
      setHandoffReason((body?.reason as HandoffReason) ?? "bad_response");
      setAppState(AppState.PIPELINE_FAILED);
    },
    [
      setRunId,
      setAppState,
      setPipelineStage,
      setHandoffReason,
      setPipelineError,
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

    let res: Response;
    try {
      res = await fetch("/api/murmur/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
    } catch {
      setHandoffReason("unreachable");
      setAppState(AppState.PIPELINE_FAILED);
      return;
    }

    const body = await res.json().catch(() => null);

    if (res.ok && body?.ok && body.status === "running") {
      setAppState(AppState.PIPELINE_RUNNING);
      return;
    }

    setHandoffReason((body?.reason as HandoffReason) ?? "bad_response");
    setAppState(AppState.PIPELINE_FAILED);
  }, [runId, setAppState, setHandoffReason, setPipelineError]);

  return { kickoffPipeline, retryHandoff };
}

export default useMurmurActions;
