"use client";

import dynamic from "next/dynamic";
import PipelineRunScreen from "@/screens/PipelineRunScreen";
import IdleWelcomeHost from "@/components/idle/IdleWelcomeHost";
import HandoffScreen from "@/screens/HandoffScreen";
import SubmittingScreen from "@/screens/SubmittingScreen";
import type { RecordingActions, RecordingScreenState } from "@/types";
import ErrorScreen from "@/screens/ErrorScreen";
import MicDeniedScreen from "@/screens/MicDeniedScreen";
import { AppState } from "@/types";

const isMicError = (message: string) =>
  /microphone|mic|permission|notallowed/i.test(message);

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
  onWatchdogRefresh?: () => void;
}

const RenderScreen = ({
  screenState,
  actions,
  onWatchdogRefresh,
}: RenderScreenProps) => {
  const {
    appState = AppState.IDLE,
    elapsedSeconds = 0,
    audioUrl,
    transcription,
    errorMessage,
    language,
    recordedAt,
    recordingStream,
    savedRecordingId,
    currentProjectId,
    setCurrentProjectId,
    setCurrentProjectIsDefault,
    runId,
    pipelineStage,
    runResults,
    longerHint,
    handoffReason,
  } = screenState;
  const {
    startRecording,
    stopRecording,
    handleReRecord,
    submitRecording,
    kickoffPipeline,
    retryPipeline,
    resumePipeline,
  } = actions;

  switch (appState) {
    case AppState.IDLE:
      return <IdleWelcomeHost onRecord={startRecording} />;
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
    case AppState.TRANSCRIBING:
      return <SubmittingScreen />;
    case AppState.SUBMITTING:
      return <HandoffScreen />;
    case AppState.DONE:
      return (
        <TranscriptionScreen
          transcription={transcription || ""}
          language={language}
          durationSeconds={elapsedSeconds}
          recordedAt={recordedAt}
          recordingId={savedRecordingId}
          onNewRecording={handleReRecord}
          onKickoffPipeline={kickoffPipeline}
        />
      );
    case AppState.PIPELINE_RUNNING:
      return (
        <PipelineRunScreen
          variant="running"
          pipelineStage={pipelineStage}
          transcription={transcription || ""}
          runResults={runResults}
          runId={runId}
          recordingId={savedRecordingId}
          showLongerHint={longerHint}
          onWatchdogRefresh={onWatchdogRefresh}
          onRetry={retryPipeline}
        />
      );
    case AppState.PIPELINE_DONE:
      return (
        <PipelineRunScreen
          variant="complete"
          pipelineStage={pipelineStage}
          transcription={transcription || ""}
          runResults={runResults}
          runId={runId}
          recordingId={savedRecordingId}
          currentProjectId={currentProjectId}
          showExpiryBanner={false}
          onNewRecording={handleReRecord}
          onProjectAssigned={(projectId, isDefault) => {
            setCurrentProjectId(projectId);
            setCurrentProjectIsDefault(isDefault);
          }}
        />
      );
    case AppState.PIPELINE_FAILED: {
      const isResumable =
        Boolean(runId) && !handoffReason && Boolean(pipelineStage);
      const onRetry =
        handoffReason === "out_of_quota" || handoffReason === "cost_halt"
          ? undefined
          : isResumable
            ? () => resumePipeline(runId!)
            : retryPipeline;
      return (
        <PipelineRunScreen
          variant="failed"
          pipelineStage={pipelineStage}
          transcription={transcription || ""}
          runResults={runResults}
          runId={runId}
          recordingId={savedRecordingId}
          handoffReason={handoffReason}
          onRetry={onRetry}
          onNewRecording={handleReRecord}
        />
      );
    }
    case AppState.ERROR: {
      const message = errorMessage || "";
      if (isMicError(message)) {
        return (
          <MicDeniedScreen
            onTryAgain={startRecording}
            onDismiss={handleReRecord}
          />
        );
      }
      return (
        <ErrorScreen
          message={message}
          onReRecord={handleReRecord}
          canRetry={Boolean(audioUrl)}
          onRetry={submitRecording}
        />
      );
    }
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
