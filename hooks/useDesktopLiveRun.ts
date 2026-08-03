"use client";

import { fetchRunResults } from "@/lib/murmur/client";
import { readLiveRunSnapshot, subscribeToLiveRun } from "@/lib/murmur/live-run";
import { deriveStateFromRun } from "@/lib/murmur/rehydrate";
import type { PipelineStage, PipelineStatus } from "@/types/pipeline";
import type { RunResults } from "@/types/run-results";
import { useEffect, useState } from "react";

const STALL_MS = 8000;

export type DesktopLiveRunState = {
  status: PipelineStatus | null;
  currentStage: PipelineStage | null;
  runResults: RunResults | null;
  error: string | null;
  pipelineError: string | null;
};

/**
 * Thin desktop live-run subscription. Unlike usePipelineRun, does not touch
 * RecordingScreenState / AppState — returns plain status for DesktopIdeaView.
 */
export function useDesktopLiveRun(
  runId: string | null,
  enabled: boolean
): DesktopLiveRunState {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(null);
  const [runResults, setRunResults] = useState<RunResults | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;

    const refreshRunResults = async () => {
      const results = await fetchRunResults(runId);
      if (!cancelled) setRunResults(results);
    };

    const hydrate = async () => {
      try {
        const snapshot = await readLiveRunSnapshot(runId);
        if (cancelled || !snapshot) return;
        setRunResults(snapshot.results);
        setStatus(snapshot.run.status);
        const derived = deriveStateFromRun(snapshot.run, snapshot.events);
        setCurrentStage(derived.pipelineStage);
        setPipelineError(derived.pipelineError);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load run");
        }
      }
    };

    void hydrate();

    if (!enabled) {
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = subscribeToLiveRun(runId, {
      onEvent: (row) => {
        if (cancelled) return;
        if (row.event === "stage_failed") {
          setCurrentStage(row.stage);
          setPipelineError(row.detail ?? null);
          setStatus("failed");
          return;
        }
        if (row.event === "stage_done") {
          void refreshRunResults();
        }
        setCurrentStage(row.stage);
      },
      onStatus: (next) => {
        if (cancelled) return;
        setStatus(next);
        if (next === "done" || next === "failed") {
          void refreshRunResults();
        }
      },
    });

    const stallId = window.setInterval(() => {
      void hydrate();
    }, STALL_MS);

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(stallId);
    };
  }, [runId, enabled]);

  if (!runId) {
    return {
      status: null,
      currentStage: null,
      runResults: null,
      error: null,
      pipelineError: null,
    };
  }

  return { status, currentStage, runResults, error, pipelineError };
}

export default useDesktopLiveRun;
