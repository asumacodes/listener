"use client";

import { microphoneErrorMessage, toUserMessage } from "@/lib/errors";
import {
  cleanBlobMime,
  MAX_RECORDING_SECONDS,
  pickAudioMime,
  recordingFilenameForMime,
  resolveBlobMime,
} from "@/lib/media/recorder";
import { saveRecording } from "@/lib/recordings/client";
import { transcribeAudio } from "@/lib/transcribe/client";
import { useCallback, useEffect, useRef, useState } from "react";

const MIN_RECORDING_SECONDS = 1;

type SubmitResult = {
  recordingId: string;
  text: string;
};

/**
 * Browser capture lifecycle for entry points that do not use the full-screen
 * recording flow. I/O stays in lib; this hook owns recorder state and cleanup.
 * Hard-stops at MAX_RECORDING_SECONDS (same cap as PWA).
 */
const useCaptureRecording = () => {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const durationRef = useRef(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearTimer = useCallback(() => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const discardTake = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      if (recorder.state === "recording") recorder.stop();
      recorderRef.current = null;
    }
    stopTracks();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    blobRef.current = null;
    chunksRef.current = [];
    durationRef.current = 0;
    setAudioUrl(null);
    setDurationSeconds(0);
    setError(null);
  }, [clearTimer, stopTracks]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    discardTake();
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = nextStream;
      setStream(nextStream);

      const chosenMime = pickAudioMime();
      const recorder = chosenMime
        ? new MediaRecorder(nextStream, { mimeType: chosenMime })
        : new MediaRecorder(nextStream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const mime = resolveBlobMime(recorder.mimeType, chosenMime);
        const blob = new Blob(chunksRef.current, { type: mime });
        blobRef.current = blob;
        const nextAudioUrl = URL.createObjectURL(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = nextAudioUrl;
        setAudioUrl(nextAudioUrl);
        stopTracks();
      };

      durationRef.current = 0;
      setDurationSeconds(0);
      recorder.start(250);
      timerRef.current = setInterval(() => {
        const next = durationRef.current + 1;
        durationRef.current = Math.min(next, MAX_RECORDING_SECONDS);
        setDurationSeconds(durationRef.current);
        if (next >= MAX_RECORDING_SECONDS) {
          clearTimer();
          if (recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
          }
        }
      }, 1000);
      return true;
    } catch (cause) {
      stopTracks();
      setError(microphoneErrorMessage(cause));
      return false;
    }
  }, [clearTimer, discardTake, stopTracks]);

  const stopRecording = useCallback(async (): Promise<boolean> => {
    clearTimer();
    const recorder = recorderRef.current;
    if (!recorder) {
      return Boolean(blobRef.current && blobRef.current.size > 0);
    }
    if (recorder.state === "recording") {
      await new Promise<void>((resolve) => {
        recorder.addEventListener("stop", () => resolve(), { once: true });
        recorder.stop();
      });
    }
    return Boolean(blobRef.current && blobRef.current.size > 0);
  }, [clearTimer]);

  const isEmptyTake = useCallback(
    () =>
      !blobRef.current ||
      blobRef.current.size === 0 ||
      durationRef.current < MIN_RECORDING_SECONDS,
    []
  );

  const submitRecording = useCallback(
    async (projectId?: string): Promise<SubmitResult | null> => {
      const blob = blobRef.current;
      if (!blob || isEmptyTake()) return null;

      setError(null);
      const mime = cleanBlobMime(blob.type);
      try {
        const transcriptionStartedAt = new Date().toISOString();
        const result = await transcribeAudio(
          blob,
          recordingFilenameForMime(mime)
        );
        const saved = await saveRecording({
          blob,
          mimeType: mime,
          durationSeconds: durationRef.current,
          transcription: result.text,
          language: result.language,
          projectId,
          assemblyaiUsd: result.assemblyaiUsd,
          assemblyaiDurationSeconds: result.assemblyaiDurationSeconds,
          transcriptReadyAt: result.transcriptReadyAt,
          transcriptionStartedAt,
        });
        return { recordingId: saved.recordingId, text: result.text };
      } catch (cause) {
        setError(toUserMessage(cause));
        return null;
      }
    },
    [isEmptyTake]
  );

  useEffect(() => discardTake, [discardTake]);

  return {
    stream,
    audioUrl,
    durationSeconds,
    error,
    maxSeconds: MAX_RECORDING_SECONDS,
    startRecording,
    stopRecording,
    isEmptyTake,
    submitRecording,
    discardTake,
  };
};

export default useCaptureRecording;
