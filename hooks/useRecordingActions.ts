"use client";

import { microphoneErrorMessage, toUserMessage } from "@/lib/errors";
import {
  cleanBlobMime,
  pickAudioMime,
  recordingFilenameForMime,
  resolveBlobMime,
} from "@/lib/media/recorder";
import { saveRecording } from "@/lib/recordings/client";
import { transcribeAudio } from "@/lib/transcribe";
import { AppState } from "@/types";
import type {
  RecordingActions,
  RecordingScreenState,
} from "@/types/recording-flow";
import { useCallback, useEffect } from "react";

const useRecordingActions = (screenState: RecordingScreenState) => {
  const {
    setAppState,
    streamRef,
    mediaRecorderRef,
    chunksRef,
    audioBlobRef,
    setAudioUrl,
    setElapsedSeconds,
    elapsedSecondsRef,
    timerRef,
    setErrorMessage,
    audioUrl,
    setTranscription,
    setLanguage,
    setRecordedAt,
    setRecordingStream,
  } = screenState;

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRecordingStream(null);
  }, [timerRef, mediaRecorderRef, streamRef, setRecordingStream]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setRecordingStream(stream);

      const chosenMime = pickAudioMime();
      const mediaRecorderInstance = chosenMime
        ? new MediaRecorder(stream, { mimeType: chosenMime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorderInstance;
      chunksRef.current = [];

      mediaRecorderInstance.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderInstance.onstop = () => {
        const mime = resolveBlobMime(
          mediaRecorderInstance.mimeType,
          chosenMime
        );
        const blob = new Blob(chunksRef.current, { type: mime });
        audioBlobRef.current = blob;
        const nextAudioUrl = URL.createObjectURL(blob);
        setAudioUrl((previousAudioUrl) => {
          if (previousAudioUrl) URL.revokeObjectURL(previousAudioUrl);
          return nextAudioUrl;
        });
        setRecordingStream(null);
        setAppState(AppState.STOPPED);
      };

      mediaRecorderInstance.start(250);
      elapsedSecondsRef.current = 0;
      setElapsedSeconds(0);
      setAppState(AppState.RECORDING);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev >= 119 ? 120 : prev + 1;
          elapsedSecondsRef.current = next;
          if (prev >= 119) stopRecording();
          return next;
        });
      }, 1000);
    } catch (error) {
      setRecordingStream(null);
      setErrorMessage(microphoneErrorMessage(error));
      setAppState(AppState.ERROR);
    }
  }, [
    stopRecording,
    streamRef,
    mediaRecorderRef,
    chunksRef,
    audioBlobRef,
    timerRef,
    elapsedSecondsRef,
    setAppState,
    setElapsedSeconds,
    setErrorMessage,
    setAudioUrl,
    setRecordingStream,
  ]);

  const submitRecording = useCallback(async () => {
    if (!audioBlobRef.current) return;
    setAppState(AppState.SUBMITTING);

    const blob = audioBlobRef.current;
    const mime = cleanBlobMime(blob.type);
    const filename = recordingFilenameForMime(mime);

    try {
      const { text, language } = await transcribeAudio(blob, filename);

      await saveRecording({
        blob,
        mimeType: mime,
        durationSeconds: elapsedSecondsRef.current,
        transcription: text,
        language,
      });

      setTranscription(text);
      setLanguage(language);
      setRecordedAt(new Date());
      setAppState(AppState.DONE);
    } catch (error) {
      setErrorMessage(toUserMessage(error));
      setAppState(AppState.ERROR);
    }
  }, [
    audioBlobRef,
    elapsedSecondsRef,
    setAppState,
    setTranscription,
    setLanguage,
    setRecordedAt,
    setErrorMessage,
  ]);

  const handleReRecord = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioBlobRef.current = null;
    setAudioUrl(null);
    chunksRef.current = [];
    elapsedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setTranscription("");
    setLanguage(null);
    setRecordedAt(null);
    setErrorMessage("");
    setRecordingStream(null);
    setAppState(AppState.IDLE);
  }, [
    audioUrl,
    audioBlobRef,
    chunksRef,
    elapsedSecondsRef,
    setElapsedSeconds,
    setTranscription,
    setLanguage,
    setRecordedAt,
    setErrorMessage,
    setRecordingStream,
    setAppState,
    setAudioUrl,
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder) {
        mediaRecorder.ondataavailable = null;
        mediaRecorder.onstop = null;
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
        mediaRecorderRef.current = null;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, mediaRecorderRef, streamRef, timerRef]);

  return {
    startRecording,
    stopRecording,
    submitRecording,
    handleReRecord,
  } satisfies RecordingActions;
};

export default useRecordingActions;
