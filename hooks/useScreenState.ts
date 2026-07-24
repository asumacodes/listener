"use client";

import { AppState } from "@/types";
import type { HandoffReason, PipelineStage } from "@/types/pipeline";
import type { RecordingScreenState } from "@/types/recording-flow";
import type { RunResults } from "@/types/run-results";
import {
  clearRecordingSession,
  writeRecordingSession,
} from "@/lib/recording-session";
import { useEffect, useRef, useState } from "react";

const useScreenState = (): RecordingScreenState => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState<Date | null>(null);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null
  );
  const [savedRecordingId, setSavedRecordingId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectIsDefault, setCurrentProjectIsDefault] = useState(true);
  const [runId, setRunId] = useState<string | null>(null);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage | null>(
    null
  );
  const [runResults, setRunResults] = useState<RunResults | null>(null);
  const [handoffReason, setHandoffReason] = useState<HandoffReason | null>(
    null
  );
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [longerHint, setLongerHint] = useState<boolean>(false);
  const [concurrentActiveRunId, setConcurrentActiveRunId] = useState<
    string | null
  >(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedSecondsRef = useRef<number>(0);

  useEffect(() => {
    if (!savedRecordingId) {
      clearRecordingSession();
      return;
    }
    if (appState === AppState.PIPELINE_DONE) {
      clearRecordingSession();
      return;
    }
    writeRecordingSession({ savedRecordingId });
  }, [savedRecordingId, appState]);

  return {
    appState,
    setAppState,
    errorMessage,
    setErrorMessage,
    elapsedSeconds,
    setElapsedSeconds,
    transcription,
    setTranscription,
    language,
    setLanguage,
    recordedAt,
    setRecordedAt,
    recordingStream,
    setRecordingStream,
    streamRef,
    mediaRecorderRef,
    chunksRef,
    audioBlobRef,
    audioUrl,
    setAudioUrl,
    timerRef,
    elapsedSecondsRef,
    savedRecordingId,
    setSavedRecordingId,
    currentProjectId,
    setCurrentProjectId,
    currentProjectIsDefault,
    setCurrentProjectIsDefault,
    runId,
    setRunId,
    pipelineStage,
    setPipelineStage,
    runResults,
    setRunResults,
    handoffReason,
    setHandoffReason,
    pipelineError,
    setPipelineError,
    longerHint,
    setLongerHint,
    concurrentActiveRunId,
    setConcurrentActiveRunId,
  };
};

export default useScreenState;
