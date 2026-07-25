"use client";

import {
  clearClientLatestRunLink,
  readLiveRunSnapshot,
} from "@/lib/murmur/live-run";
import { deriveStateFromRun } from "@/lib/murmur/rehydrate";
import {
  WATCHDOG_BACKOFF_MS,
  WATCHDOG_GLOBAL_CEILING_MS,
} from "@/lib/pipeline/watchdog";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import { useCallback, useEffect, useRef } from "react";

export function useStallWatchdog(state: RecordingScreenState) {
  const {
    runId,
    savedRecordingId,
    appState,
    pipelineStage,
    setAppState,
    setPipelineStage,
    setPipelineError,
    setRunResults,
    setLongerHint,
  } = state;
  const isRunning = appState === AppState.PIPELINE_RUNNING;

  const reconcile = useCallback(async () => {
    if (!runId) return;

    const snapshot = await readLiveRunSnapshot(runId);
    if (!snapshot) return;

    setRunResults(snapshot.results);

    const derived = deriveStateFromRun(snapshot.run, snapshot.events);

    setPipelineStage(derived.pipelineStage);
    if (snapshot.run.status === "done") {
      setLongerHint(false);
      setAppState(AppState.PIPELINE_DONE);
      if (savedRecordingId) {
        void clearClientLatestRunLink(savedRecordingId);
      }
    } else if (
      snapshot.run.status === "failed" ||
      derived.appState === AppState.PIPELINE_FAILED
    ) {
      setLongerHint(false);
      setPipelineError(derived.pipelineError);
      setAppState(AppState.PIPELINE_FAILED);
      if (savedRecordingId) {
        void clearClientLatestRunLink(savedRecordingId);
      }
    }
  }, [
    runId,
    savedRecordingId,
    setAppState,
    setPipelineStage,
    setPipelineError,
    setRunResults,
    setLongerHint,
  ]);

  const refreshNow = useCallback(() => {
    setLongerHint(false);
    void reconcile();
  }, [reconcile, setLongerHint]);

  const refreshRef = useRef(refreshNow);
  useEffect(() => {
    refreshRef.current = refreshNow;
  }, [refreshNow]);

  const refresh = useCallback(() => refreshRef.current(), []);

  useEffect(() => {
    if (!isRunning || !runId) {
      setLongerHint(false);
      return;
    }

    setLongerHint(false);
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const offset of WATCHDOG_BACKOFF_MS) {
      timers.push(
        setTimeout(() => {
          if (!cancelled) void reconcile();
        }, offset)
      );
    }

    timers.push(
      setTimeout(() => {
        if (!cancelled) setLongerHint(true);
      }, WATCHDOG_GLOBAL_CEILING_MS)
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isRunning, runId, pipelineStage, reconcile, setLongerHint]);

  return { refresh };
}

export default useStallWatchdog;
