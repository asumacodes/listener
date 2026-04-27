"use client";

import { AppState } from "@/types";
import { useScreenState } from ".";
import { useCallback, useEffect } from "react";

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
  } = screenState;

  const stopRecording = useCallback(() => {
    // clear timer, stop media recorder, and stop stream

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [timerRef, mediaRecorderRef, streamRef]);

  const startRecording = useCallback(async () => {
    try {
      // get user media permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // create media recorder instance, and push instance to mediaRecorderRef
      const mediaRecorderInstance = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorderInstance;
      chunksRef.current = [];

      // push small chunks to chunksRef
      mediaRecorderInstance.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // when recording is stopped, create a blob from chunks and push to audioBlobRef, and set audioUrl
      mediaRecorderInstance.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        const nextAudioUrl = URL.createObjectURL(blob);
        setAudioUrl((previousAudioUrl) => {
          if (previousAudioUrl) URL.revokeObjectURL(previousAudioUrl);
          return nextAudioUrl;
        });
        setAppState(AppState.STOPPED);
      };

      // start recording
      mediaRecorderInstance.start(250);
      setElapsedSeconds(0);
      setAppState(AppState.RECORDING);

      // start timer for 2s
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
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          setErrorMessage("Microphone access is required to record.");
        } else if (error.name === "NotFoundError") {
          setErrorMessage("No microphone found.");
        } else {
          setErrorMessage(`Microphone error: ${error.message}`);
        }
      } else {
        setErrorMessage("Unable to start recording. Please try again.");
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
  ]);

  const submitRecording = useCallback(async () => {
    if (!audioBlobRef.current) return;
    setAppState(AppState.SUBMITTING);

    // submit recording to server
    try {
      const formData = new FormData();
      formData.append("audio", audioBlobRef.current, "recording.webm");

      // call transcribe api
      // TODO: are we not making a wrapper over this?
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text } = await res.json();
      setTranscription(
        text?.trim() ||
          "Nothing was transcribed. Try speaking closer to your microphone."
      );
      setAppState(AppState.DONE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.includes("502")
          ? "Transcription service unreachable. Make sure faster-whisper is running."
          : "Request failed. Check your connection and try again."
      );
      setAppState(AppState.ERROR);
    }
  }, [audioBlobRef, setAppState, setTranscription, setErrorMessage]);

  const handleReRecord = useCallback(() => {
    // reset all states
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioBlobRef.current = null;
    setAudioUrl(null);
    chunksRef.current = [];
    setElapsedSeconds(0);
    setTranscription("");
    setErrorMessage("");
    setAppState(AppState.IDLE);
  }, [
    audioUrl,
    audioBlobRef,
    chunksRef,
    setElapsedSeconds,
    setTranscription,
    setErrorMessage,
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
