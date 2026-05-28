"use client";

import dynamic from "next/dynamic";
import IdleScreen from "@/screens/IdleScreen";
import type { RecordingActions, RecordingScreenState } from "@/types";
import SubmittingScreen from "@/screens/SubmittingScreen";
import ErrorScreen from "@/screens/ErrorScreen";
import { AppState } from "@/types";

const RecordingScreen = dynamic(() => import("@/screens/RecordingScreen"), {
  ssr: false,
});

const PlaybackScreen = dynamic(() => import("@/screens/PlaybackScreen"), {
  ssr: false,
});

const TranscriptionScreen = dynamic(
  () => import("@/screens/TranscriptionScreen"),
  { ssr: false }
);

interface RenderScreenProps {
  screenState: RecordingScreenState;
  actions: RecordingActions;
}

const RenderScreen = ({ screenState, actions }: RenderScreenProps) => {
  const {
    appState = AppState.IDLE,
    elapsedSeconds = 0,
    audioUrl,
    transcription,
    errorMessage,
    language,
    recordedAt,
    recordingStream,
  } = screenState;
  const { startRecording, stopRecording, handleReRecord, submitRecording } =
    actions;

  switch (appState) {
    case AppState.IDLE:
      return <IdleScreen onRecord={startRecording} />;
    case AppState.RECORDING:
      return (
        <RecordingScreen
          elapsedSeconds={elapsedSeconds}
          recordingStream={recordingStream}
          onStop={stopRecording}
        />
      );
    case AppState.STOPPED:
      return (
        <PlaybackScreen
          audioUrl={audioUrl || ""}
          durationSeconds={elapsedSeconds}
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
          language={language}
          durationSeconds={elapsedSeconds}
          recordedAt={recordedAt}
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
    default: {
      const exhaustiveCheck: never = appState;
      return (
        <ErrorScreen
          message={`Unsupported app state: ${exhaustiveCheck}`}
          onReRecord={handleReRecord}
          canRetry={false}
          onRetry={submitRecording}
        />
      );
    }
  }
};

export default RenderScreen;
