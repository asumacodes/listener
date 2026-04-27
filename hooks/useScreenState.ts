"use client";

import { AppState } from "@/types";
import { useRef, useState } from "react";

const useScreenState = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return {
    appState,
    setAppState,
    errorMessage,
    setErrorMessage,
    elapsedSeconds,
    setElapsedSeconds,
    transcription,
    setTranscription,
    streamRef,
    mediaRecorderRef,
    chunksRef,
    audioBlobRef,
    audioUrl,
    setAudioUrl,
    timerRef,
  };
};

export default useScreenState;
