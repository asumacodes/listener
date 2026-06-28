"use client";

import { fetchRunResults } from "@/lib/murmur/client";
import { deriveStateFromRun } from "@/lib/murmur/rehydrate";
import { clearLatestRunLink } from "@/lib/murmur/runs";
import { toPipelineRunRow, toRunEventRow } from "@/lib/murmur/run-rows";
import {
  WATCHDOG_BACKOFF_MS,
  WATCHDOG_GLOBAL_CEILING_MS,
} from "@/lib/pipeline/watchdog";
import { createClient } from "@/lib/supabase/client";
import { AppState } from "@/types/app-state";
import type { RunEventRow } from "@/types/pipeline";
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

    const supabase = createClient();
    const [{ data: run }, { data: events }, results] = await Promise.all([
      supabase
        .from("pipeline_runs")
        .select("id, status, current_stage")
        .eq("id", runId)
        .single(),
      supabase
        .from("run_events")
        .select("run_id, stage, event, detail, created_at")
        .eq("run_id", runId)
        .order("created_at", { ascending: true }),
      fetchRunResults(runId),
    ]);

    const parsedRun = toPipelineRunRow(run);
    if (!parsedRun) return;

    setRunResults(results);

    const parsedEvents = (events ?? [])
      .map((row) => toRunEventRow(row))
      .filter((row): row is RunEventRow => row !== null);
    const derived = deriveStateFromRun(parsedRun, parsedEvents);

    setPipelineStage(derived.pipelineStage);
    if (parsedRun.status === "done") {
      setLongerHint(false);
      setAppState(AppState.PIPELINE_DONE);
      if (savedRecordingId) {
        void clearLatestRunLink(savedRecordingId, supabase);
      }
    } else if (
      parsedRun.status === "failed" ||
      derived.appState === AppState.PIPELINE_FAILED
    ) {
      setLongerHint(false);
      setPipelineError(derived.pipelineError);
      setAppState(AppState.PIPELINE_FAILED);
      if (savedRecordingId) {
        void clearLatestRunLink(savedRecordingId, supabase);
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

  return { refresh: () => refreshRef.current() };
}

export default useStallWatchdog;
