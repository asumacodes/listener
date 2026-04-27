"use client";

import { useRecordingActions, useScreenState } from "@/hooks";
import ErrorScreen from "@/screens/ErrorScreen";
import IdleScreen from "@/screens/IdleScreen";
import PlaybackScreen from "@/screens/PlaybackScreen";
import RecordingScreen from "@/screens/RecordingScreen";
import SubmittingScreen from "@/screens/SubmittingScreen";
import TranscriptionScreen from "@/screens/TranscriptionScreen";
import { AppState } from "@/types";
import { useEffect } from "react";

interface RenderScreenProps {
  screenState: ReturnType<typeof useScreenState>;
  actions: ReturnType<typeof useRecordingActions>;
}

const RenderScreen = ({ screenState, actions }: RenderScreenProps) => {
  const {
    appState = AppState.IDLE,
    elapsedSeconds = 0,
    audioUrl,
    transcription,
    errorMessage,
  } = screenState;
  const { startRecording, stopRecording, handleReRecord, submitRecording } =
    actions;

  useEffect(() => {
    console.log("appState 1", appState);
  }, [appState]);

  switch (appState) {
    case AppState.IDLE:
      return <IdleScreen onRecord={startRecording} />;
    case AppState.RECORDING:
      return (
        <RecordingScreen
          elapsedSeconds={elapsedSeconds}
          onStop={stopRecording}
        />
      );
    case AppState.STOPPED:
      return (
        <PlaybackScreen
          audioUrl={audioUrl || ""}
          onReRecord={handleReRecord}
          onConfirm={submitRecording}
        />
      );
    case AppState.SUBMITTING:
      return <SubmittingScreen />;
    case AppState.DONE:
      return (
        <TranscriptionScreen
          transcription={transcription || ""}
          onNewRecording={handleReRecord}
        />
      );
    case AppState.ERROR:
      return (
        <ErrorScreen
          message={errorMessage || ""}
          onReRecord={handleReRecord}
          canRetry={Boolean(audioUrl)}
          onRetry={submitRecording}
        />
      );
  }
};

export default RenderScreen;
