"use client";

import { resumeActivePipeline } from "@/lib/murmur/resume";
import { readRecordingSession } from "@/lib/recording-session";
import { createClient } from "@/lib/supabase/client";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import { useEffect, useState } from "react";

/**
 * Resolves sessionStorage after mount (SSR-safe). Until ready, show bootstrap UI
 * so server and client first paint match and we avoid reading session on init.
 */
export function useSessionRestore(state: RecordingScreenState) {
  const {
    setSavedRecordingId,
    setRunId,
    setAppState,
    setPipelineStage,
    setPipelineError,
  } = state;

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const recordingId = readRecordingSession()?.savedRecordingId;

      if (!recordingId) {
        if (!cancelled) setIsAppReady(true);
        return;
      }

      setSavedRecordingId(recordingId);
      const supabase = createClient();
      const resume = await resumeActivePipeline(recordingId, supabase);
      if (cancelled) return;

      if (resume) {
        setRunId(resume.runId);
        setPipelineStage(resume.derived.pipelineStage);
        setPipelineError(resume.derived.pipelineError);
        setAppState(resume.derived.appState);
      } else {
        setAppState(AppState.IDLE);
      }

      setIsAppReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    setSavedRecordingId,
    setRunId,
    setAppState,
    setPipelineStage,
    setPipelineError,
  ]);

  return { isAppReady };
}

export default useSessionRestore;
