"use client";

import {
  resumeActivePipeline,
  resumeActiveRunForUser,
  type ActivePipelineResume,
} from "@/lib/murmur/resume";
import { readRecordingSession } from "@/lib/recording-session";
import { AppState } from "@/types/app-state";
import type { RecordingScreenState } from "@/types/recording-flow";
import { useEffect, useState } from "react";

export type RestoreMode = "none" | "pipeline";

/**
 * Resolves sessionStorage after mount (SSR-safe). Until ready, show bootstrap UI
 * so server and client first paint match and we avoid reading session on init.
 */
export function useSessionRestore(state: RecordingScreenState) {
  const {
    setSavedRecordingId,
    setRunId,
    setAppState,
    setElapsedSeconds,
    setTranscription,
    setLanguage,
    setRecordedAt,
    setPipelineStage,
    setPipelineError,
  } = state;

  const [isAppReady, setIsAppReady] = useState(false);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>("none");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const recordingId = readRecordingSession()?.savedRecordingId;

      if (!recordingId) {
        const recovered = await resumeActiveRunForUser();
        if (cancelled) return;

        if (recovered) {
          setRestoreMode("pipeline");
          if (recovered.recordingId) setSavedRecordingId(recovered.recordingId);
          restorePipeline(recovered);
        }
        setIsAppReady(true);
        return;
      }

      setRestoreMode("pipeline");
      setSavedRecordingId(recordingId);
      const resume = await resumeActivePipeline(recordingId);
      if (cancelled) return;

      if (resume) {
        restorePipeline(resume);
      } else {
        setAppState(AppState.IDLE);
      }

      setIsAppReady(true);
    })();

    return () => {
      cancelled = true;
    };

    function restorePipeline(resume: ActivePipelineResume) {
      setTranscription(resume.recording.transcription);
      setLanguage(resume.recording.language);
      setElapsedSeconds(resume.recording.durationSeconds);
      setRecordedAt(new Date(resume.recording.recordedAt));
      setRunId(resume.runId);
      setPipelineStage(resume.derived.pipelineStage);
      setPipelineError(resume.derived.pipelineError);
      setAppState(resume.derived.appState);
    }
  }, [
    setSavedRecordingId,
    setRunId,
    setAppState,
    setElapsedSeconds,
    setTranscription,
    setLanguage,
    setRecordedAt,
    setPipelineStage,
    setPipelineError,
  ]);

  return { isAppReady, restoreMode };
}

export default useSessionRestore;
