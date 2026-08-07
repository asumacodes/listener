"use client";

import { fetchRunResults } from "@/lib/murmur/client";
import { trackRunCompleted } from "@/lib/analytics/events";
import { hasFired, markFired } from "@/lib/analytics/run-fired-guard";
import { readLiveRunSnapshot, subscribeToLiveRun } from "@/lib/murmur/live-run";
import { deriveStateFromRun } from "@/lib/murmur/rehydrate";
import {
  deriveStageStatuses,
  type StageStatusMap,
} from "@/lib/pipeline/artifact-stage";
import {
  normalizeStepperStage,
  PIPELINE_STEPPER_ORDER,
} from "@/lib/pipeline/stage-copy";
import type {
  PipelineStage,
  PipelineStatus,
  RunEventRow,
} from "@/types/pipeline";
import type { RunResults } from "@/types/run-results";
import { useEffect, useRef, useState } from "react";

const STALL_MS = 8000;
const RESULTS_DEBOUNCE_MS = 150;

export type DesktopLiveRunState = {
  status: PipelineStatus | null;
  currentStage: PipelineStage | null;
  runResults: RunResults | null;
  error: string | null;
  pipelineError: string | null;
  /** Per-stage status, independent of artifact payload presence. */
  stageStatuses: StageStatusMap;
};

const eventKey = (row: RunEventRow): string =>
  `${row.stage}|${row.event}|${row.created_at}`;

const stageOrderIndex = (stage: PipelineStage | null): number => {
  if (!stage || stage === "transcribing") return -1;
  return PIPELINE_STEPPER_ORDER.indexOf(normalizeStepperStage(stage));
};

/**
 * Thin desktop live-run subscription. Unlike usePipelineRun, does not touch
 * RecordingScreenState / AppState — returns plain status for DesktopIdeaView.
 */
export function useDesktopLiveRun(
  runId: string | null,
  enabled: boolean,
  recordingId?: string | null
): DesktopLiveRunState {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(null);
  const [runResults, setRunResults] = useState<RunResults | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<RunEventRow[]>([]);
  const [eventsRunId, setEventsRunId] = useState(runId);
  const resultsTimer = useRef<number | null>(null);

  // Reset event buffer when the tracked run changes (render-time adjust).
  if (runId !== eventsRunId) {
    setEventsRunId(runId);
    setEvents([]);
  }

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;

    const maybeTrackCompleted = (nextStatus: PipelineStatus | null) => {
      if (
        nextStatus === "done" &&
        recordingId &&
        !hasFired("run_completed", runId)
      ) {
        trackRunCompleted(runId, recordingId, "desktop");
        markFired("run_completed", runId);
      }
    };

    const scheduleRefreshResults = () => {
      if (resultsTimer.current != null) {
        window.clearTimeout(resultsTimer.current);
      }
      resultsTimer.current = window.setTimeout(() => {
        resultsTimer.current = null;
        void (async () => {
          const results = await fetchRunResults(runId);
          if (!cancelled) setRunResults(results);
        })();
      }, RESULTS_DEBOUNCE_MS);
    };

    const advanceStage = (stage: PipelineStage) => {
      setCurrentStage((prev) => {
        if (stageOrderIndex(stage) >= stageOrderIndex(prev)) return stage;
        return prev;
      });
    };

    const hydrate = async () => {
      try {
        const snapshot = await readLiveRunSnapshot(runId);
        if (cancelled || !snapshot) return;
        setRunResults(snapshot.results);
        setStatus(snapshot.run.status);
        maybeTrackCompleted(snapshot.run.status);
        setEvents(snapshot.events);
        const derived = deriveStateFromRun(snapshot.run, snapshot.events);
        // Prefer run row stage when events would regress (hydrate is authoritative).
        setCurrentStage(snapshot.run.current_stage ?? derived.pipelineStage);
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
        if (resultsTimer.current != null) {
          window.clearTimeout(resultsTimer.current);
        }
      };
    }

    const unsubscribe = subscribeToLiveRun(runId, {
      onEvent: (row) => {
        if (cancelled) return;
        setEvents((prev) => {
          const key = eventKey(row);
          if (prev.some((e) => eventKey(e) === key)) return prev;
          return [...prev, row];
        });
        if (row.event === "stage_failed") {
          setCurrentStage(row.stage);
          setPipelineError(row.detail ?? null);
          setStatus("failed");
          return;
        }
        if (row.event === "stage_started") {
          advanceStage(row.stage);
          scheduleRefreshResults();
          return;
        }
        if (row.event === "stage_done") {
          // Do not regress currentStage on late done events.
          scheduleRefreshResults();
        }
      },
      onStatus: (run) => {
        if (cancelled) return;
        setStatus(run.status);
        maybeTrackCompleted(run.status);
        if (run.current_stage) {
          advanceStage(run.current_stage);
        }
        if (run.status === "done" || run.status === "failed") {
          scheduleRefreshResults();
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
      if (resultsTimer.current != null) {
        window.clearTimeout(resultsTimer.current);
      }
    };
  }, [runId, enabled, recordingId]);

  if (!runId) {
    return {
      status: null,
      currentStage: null,
      runResults: null,
      error: null,
      pipelineError: null,
      stageStatuses: deriveStageStatuses({ status: null, currentStage: null }),
    };
  }

  return {
    status,
    currentStage,
    runResults,
    error,
    pipelineError,
    stageStatuses: deriveStageStatuses({ status, currentStage, events }),
  };
}

export default useDesktopLiveRun;
