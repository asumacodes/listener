// hooks/usePipelineRun.ts
//
// Owns the Realtime subscription lifecycle for an active pipeline run (KAN-32 Phase 3/4).
// State is DERIVED FROM POSTGRES, never client-only:
//   - On mount / runId change: rehydrate from pipeline_runs + run_events (tab-close recovery).
//   - Live: subscribe to run_events INSERTs (stage progress) and pipeline_runs UPDATEs
//     (terminal status) filtered by run_id.
//   - Reconcile: if the machine is in PIPELINE_FAILED but the DB says the run is actually
//     running/done (a torn-network false failure, or a not_retryable race), self-heal.
//
// Tab-refresh bootstrap lives in useSessionRestore + lib/murmur/resume.ts.

"use client";

import { deriveStateFromRun } from "@/lib/murmur/rehydrate";
import { fetchRunResults } from "@/lib/murmur/client";
import {
  clearClientLatestRunLink,
  readLiveRunSnapshot,
  subscribeToLiveRun,
} from "@/lib/murmur/live-run";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import type { PipelineStatus, RunEventRow } from "@/types/pipeline";
import { useEffect, useRef } from "react";

export function usePipelineRun(state: RecordingScreenState) {
  const {
    runId,
    savedRecordingId,
    appState,
    setAppState,
    setPipelineStage,
    setPipelineError,
    setRunResults,
  } = state;

  const appStateRef = useRef(appState);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;

    const refreshRunResults = async () => {
      const results = await fetchRunResults(runId);
      if (!cancelled) {
        setRunResults(results);
      }
    };

    const applyEvent = (row: RunEventRow) => {
      if (row.event === "stage_failed") {
        setPipelineStage(row.stage);
        setPipelineError(row.detail ?? null);
        setAppState(AppState.PIPELINE_FAILED);
        return;
      }
      if (row.event === "stage_done") {
        void refreshRunResults();
      }
      setPipelineStage(row.stage);
    };

    const applyTerminal = (status: PipelineStatus) => {
      if (status === "done") {
        void refreshRunResults();
        setAppState(AppState.PIPELINE_DONE);
        if (savedRecordingId) {
          void clearClientLatestRunLink(savedRecordingId);
        }
      } else if (status === "failed") {
        setAppState(AppState.PIPELINE_FAILED);
        if (savedRecordingId) {
          void clearClientLatestRunLink(savedRecordingId);
        }
      } else if (status === "running") {
        if (appStateRef.current === AppState.PIPELINE_FAILED) {
          setPipelineError(null);
          setAppState(AppState.PIPELINE_RUNNING);
        }
      }
    };

    void (async () => {
      const snapshot = await readLiveRunSnapshot(runId);
      if (cancelled || !snapshot) return;
      setRunResults(snapshot.results);

      const derived = deriveStateFromRun(snapshot.run, snapshot.events);
      setPipelineStage(derived.pipelineStage);

      setPipelineError(derived.pipelineError);
      setAppState(derived.appState);

      if (
        savedRecordingId &&
        (snapshot.run.status === "done" || snapshot.run.status === "failed")
      ) {
        void clearClientLatestRunLink(savedRecordingId);
      }
    })();

    const unsubscribe = subscribeToLiveRun(runId, {
      onEvent: (event) => {
        if (!cancelled) applyEvent(event);
      },
      onStatus: (status) => {
        if (!cancelled) applyTerminal(status);
      },
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    runId,
    savedRecordingId,
    setAppState,
    setPipelineStage,
    setPipelineError,
    setRunResults,
  ]);
}

export default usePipelineRun;
