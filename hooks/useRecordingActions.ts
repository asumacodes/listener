"use client";

import { AppState } from "@/types";
import { useScreenState } from ".";
import { useCallback, useEffect } from "react";

const TRANSCRIPTION_ERROR =
  "Transcription couldn't complete on this device. Check your microphone permissions and try recording again.";

const useRecordingActions = (
  screenState: ReturnType<typeof useScreenState>
) => {
  const {
    setAppState,
    streamRef,
    mediaRecorderRef,
    chunksRef,
    audioBlobRef,
    setAudioUrl,
    setElapsedSeconds,
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

      const mediaRecorderInstance = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorderInstance;
      chunksRef.current = [];

      mediaRecorderInstance.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderInstance.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
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
      setElapsedSeconds(0);
      setAppState(AppState.RECORDING);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= 119) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      setRecordingStream(null);
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          setErrorMessage(
            "Microphone access is required. Check your permissions and try recording again."
          );
        } else if (error.name === "NotFoundError") {
          setErrorMessage(
            "No microphone found. Connect a microphone and try recording again."
          );
        } else {
          setErrorMessage(
            `Microphone error: ${error.message}. Try recording again.`
          );
        }
      } else {
        setErrorMessage(
          "Unable to start recording. Check your microphone permissions and try again."
        );
      }

      setAppState(AppState.ERROR);
    }
  }, [
    stopRecording,
    streamRef,
    mediaRecorderRef,
    chunksRef,
    audioBlobRef,
    timerRef,
    setAppState,
    setElapsedSeconds,
    setErrorMessage,
    setAudioUrl,
    setRecordingStream,
  ]);

  const submitRecording = useCallback(async () => {
    if (!audioBlobRef.current) return;
    setAppState(AppState.SUBMITTING);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlobRef.current, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text, language: detectedLanguage } = await res.json();
      setTranscription(
        text?.trim() ||
          "Nothing was transcribed. Try speaking closer to your microphone."
      );
      setLanguage(detectedLanguage ?? null);
      setRecordedAt(new Date());
      setAppState(AppState.DONE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.includes("502")
          ? TRANSCRIPTION_ERROR
          : TRANSCRIPTION_ERROR
      );
      setAppState(AppState.ERROR);
    }
  }, [
    audioBlobRef,
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
  };
};

export default useRecordingActions;
