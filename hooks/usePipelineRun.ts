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
import { toPipelineRunRow, toRunEventRow } from "@/lib/murmur/run-rows";
import { createClient } from "@/lib/supabase/client";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import type { PipelineStatus, RunEventRow } from "@/types/pipeline";
import { useEffect, useRef } from "react";

export function usePipelineRun(state: RecordingScreenState) {
  const { runId, appState, setAppState, setPipelineStage, setPipelineError } =
    state;

  const appStateRef = useRef(appState);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    if (!runId) return;

    // Snapshot appState when this subscription starts. Used to avoid rehydrate
    // clobbering the kickoff/retry HTTP ack (PIPELINE_RUNNING) with a stale
    // queued read that deriveStateFromRun maps to PIPELINE_FAILED.
    const appStateOnSubscribe = appState;

    const supabase = createClient();
    let cancelled = false;

    const applyEvent = (row: RunEventRow) => {
      if (row.event === "stage_failed") {
        setPipelineStage(row.stage);
        setPipelineError(row.detail ?? null);
        setAppState(AppState.PIPELINE_FAILED);
        return;
      }
      setPipelineStage(row.stage);
    };

    const applyTerminal = (status: PipelineStatus) => {
      if (status === "done") {
        setAppState(AppState.PIPELINE_DONE);
      } else if (status === "failed") {
        setAppState(AppState.PIPELINE_FAILED);
      } else if (status === "running") {
        if (appStateRef.current === AppState.PIPELINE_FAILED) {
          setPipelineError(null);
          setAppState(AppState.PIPELINE_RUNNING);
        }
      }
    };

    void (async () => {
      const [{ data: run }, { data: events }] = await Promise.all([
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
      ]);

      if (cancelled || !run) return;

      const parsedRun = toPipelineRunRow(run);
      if (!parsedRun) return;

      const parsedEvents = (events ?? [])
        .map((row) => toRunEventRow(row))
        .filter((row): row is RunEventRow => row !== null);

      const derived = deriveStateFromRun(parsedRun, parsedEvents);
      setPipelineStage(derived.pipelineStage);

      const staleQueuedRead =
        derived.appState === AppState.PIPELINE_FAILED &&
        parsedRun.status === "queued" &&
        appStateOnSubscribe === AppState.PIPELINE_RUNNING;

      if (staleQueuedRead) {
        return;
      }

      setPipelineError(derived.pipelineError);
      setAppState(derived.appState);
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
    // appState intentionally omitted — snapshot as appStateOnSubscribe per runId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, setAppState, setPipelineStage, setPipelineError]);
}

export default usePipelineRun;
