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
import { clearLatestRunLink } from "@/lib/murmur/runs";
import { toPipelineRunRow, toRunEventRow } from "@/lib/murmur/run-rows";
import { createClient } from "@/lib/supabase/client";
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

    const supabase = createClient();
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
          void clearLatestRunLink(savedRecordingId, supabase);
        }
      } else if (status === "failed") {
        setAppState(AppState.PIPELINE_FAILED);
        if (savedRecordingId) {
          void clearLatestRunLink(savedRecordingId, supabase);
        }
      } else if (status === "running") {
        if (appStateRef.current === AppState.PIPELINE_FAILED) {
          setPipelineError(null);
          setAppState(AppState.PIPELINE_RUNNING);
        }
      }
    };

    void (async () => {
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

      if (cancelled || !run) return;
      setRunResults(results);

      const parsedRun = toPipelineRunRow(run);
      if (!parsedRun) return;

      const parsedEvents = (events ?? [])
        .map((row) => toRunEventRow(row))
        .filter((row): row is RunEventRow => row !== null);

      const derived = deriveStateFromRun(parsedRun, parsedEvents);
      setPipelineStage(derived.pipelineStage);

      setPipelineError(derived.pipelineError);
      setAppState(derived.appState);

      if (
        savedRecordingId &&
        (parsedRun.status === "done" || parsedRun.status === "failed")
      ) {
        void clearLatestRunLink(savedRecordingId, supabase);
      }
    })();

    const channel = supabase
      .channel(`murmur-run-${runId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "run_events",
          filter: `run_id=eq.${runId}`,
        },
        (payload) => {
          const row = toRunEventRow(payload.new);
          if (!cancelled && row) applyEvent(row);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pipeline_runs",
          filter: `id=eq.${runId}`,
        },
        (payload) => {
          const row = toPipelineRunRow(payload.new);
          if (!cancelled && row) applyTerminal(row.status);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
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
