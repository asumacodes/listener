"use client";

import { AppState } from "@/types";
import { useScreenState } from ".";

const useRecordingActions = (
  screenState: ReturnType<typeof useScreenState>,
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

  const startRecording = async () => {
    console.log("startRecording");

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
        console.log("ondataavailable", e);
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // when recording is stopped, create a blob from chunks and push to audioBlobRef, and set audioUrl
      mediaRecorderInstance.onstop = () => {
        console.log("onstop", chunksRef.current);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        console.log("blob", URL.createObjectURL(blob));
        setAudioUrl(URL.createObjectURL(blob));
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
      }

      setAppState(AppState.ERROR);
    }
  };

  const stopRecording = () => {
    console.log("stopRecording");

    // clear timer, stop media recorder, and stop stream
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const submitRecording = async () => {
    console.log("submitRecording");

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
          "Nothing was transcribed. Try speaking closer to your microphone.",
      );
      setAppState(AppState.DONE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.includes("502")
          ? "Transcription service unreachable. Make sure faster-whisper is running."
          : "Request failed. Check your connection and try again.",
      );
      setAppState(AppState.ERROR);
    }
  };

  const handleReRecord = () => {
    console.log("handleReRecord");

    // reset all states
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioBlobRef.current = null;
    setAudioUrl(null);
    chunksRef.current = [];
    setElapsedSeconds(0);
    setTranscription("");
    setErrorMessage("");
    setAppState(AppState.IDLE);
  };

  return {
    startRecording,
    stopRecording,
    submitRecording,
    handleReRecord,
  };
};

export default useRecordingActions;
