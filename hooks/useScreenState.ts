"use client";

import { AppState } from "@/types";
import type { RecordingScreenState } from "@/types/recording-flow";
import { useRef, useState } from "react";

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

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedSecondsRef = useRef<number>(0);

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
  };
};

export default useScreenState;
