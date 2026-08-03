"use client";

import {
  CaptureAtlassianGateState,
  CaptureEmptyTakeState,
  CaptureIdleState,
  CaptureMicBlockedState,
  CaptureQuotaState,
  CaptureRecordingState,
  CaptureReviewState,
  CaptureTranscriptState,
  CaptureTranscribingState,
  CaptureTypedState,
} from "@/components/desktop/capture/CaptureStates";
import {
  CAPTURE_EDGE_STATES,
  default as useCaptureModal,
} from "@/hooks/useCaptureModal";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/**
 * Desktop capture dialog — presentation only.
 * State machine + I/O live in useCaptureModal / useCaptureRecording / useCaptureProject.
 */
const CaptureLauncherModal = () => {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const modal = useCaptureModal();

  if (!mounted || !modal.open) return null;

  const isWideGate =
    modal.state === "atlassian-gate" || modal.state === "mic-blocked";
  const isEdge = CAPTURE_EDGE_STATES.includes(modal.state);
  const shellWidth = isWideGate
    ? "w-[min(520px,calc(100vw-2rem))]"
    : isEdge
      ? "w-[min(420px,calc(100vw-2rem))]"
      : "w-[min(520px,calc(100vw-2rem))]";
  const shellClass = isEdge
    ? `relative ${shellWidth} rounded-3xl border border-border bg-surface px-[34px] pt-9 pb-[30px] shadow-[0_24px_80px_rgba(26,26,26,0.22)]`
    : `relative ${shellWidth} rounded-3xl border border-border bg-surface px-8 pt-9 pb-8 shadow-toast`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Close capture"
        className="absolute inset-0 cursor-default bg-[var(--scrim)]"
        onClick={modal.onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-modal-title"
        className={shellClass}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={modal.onDismiss}
          aria-label="Close"
          className="absolute top-[18px] right-5 text-[15px] text-muted transition hover:text-text"
        >
          ×
        </button>

        {modal.state === "idle" ? (
          <CaptureIdleState
            project={modal.project}
            projectPickerOpen={modal.projectPickerOpen}
            onProjectPickerOpenChange={modal.setProjectPickerOpen}
            onRecord={() => void modal.beginRecording()}
            onType={() => modal.setState("typed")}
          />
        ) : null}

        {modal.state === "recording" ? (
          <CaptureRecordingState
            elapsedSeconds={modal.recording.durationSeconds}
            maxSeconds={modal.recording.maxSeconds}
            stream={modal.recording.stream}
            onStop={() => void modal.stopRecording()}
          />
        ) : null}

        {modal.state === "review" ? (
          <CaptureReviewState
            audioUrl={modal.recording.audioUrl}
            durationSeconds={modal.recording.durationSeconds}
            error={modal.recording.error}
            onConfirm={() => void modal.confirmRecording()}
            onReRecord={() => void modal.beginRecording()}
          />
        ) : null}

        {modal.state === "transcript" ? (
          <CaptureTranscriptState
            text={modal.transcriptBody}
            durationSeconds={
              modal.savedVoiceRecordingId
                ? modal.recording.durationSeconds
                : undefined
            }
            busy={modal.kickoffBusy}
            error={modal.kickoffError}
            editDisabled={Boolean(modal.savedVoiceRecordingId)}
            onRun={() => void modal.runPipeline()}
            onEdit={() => {
              modal.setTypedText(modal.transcriptBody);
              modal.setSavedVoiceRecordingId(null);
              modal.setState("typed");
            }}
            onReRecord={() => void modal.beginRecording()}
          />
        ) : null}

        {modal.state === "mic-blocked" ? (
          <CaptureMicBlockedState
            onRetry={() => void modal.beginRecording()}
            onType={() => modal.setState("typed")}
          />
        ) : null}

        {modal.state === "transcribing" ? (
          <CaptureTranscribingState
            durationSeconds={modal.recording.durationSeconds}
          />
        ) : null}

        {modal.state === "atlassian-gate" ? (
          <CaptureAtlassianGateState
            onConnect={() => {
              const popup = window.open(
                "/api/integrations/atlassian/start?mode=popup",
                "atlassian_oauth",
                "width=520,height=720"
              );
              if (!popup || popup.closed) {
                window.location.href = "/api/integrations/atlassian/start";
              }
            }}
          />
        ) : null}

        {modal.state === "quota" ? (
          <CaptureQuotaState onDismiss={modal.onDismiss} />
        ) : null}

        {modal.state === "typed" ? (
          <CaptureTypedState
            value={modal.typedText}
            onChange={modal.setTypedText}
            project={modal.project}
            projectPickerOpen={modal.projectPickerOpen}
            onProjectPickerOpenChange={modal.setProjectPickerOpen}
            onContinue={() => {
              modal.setTranscriptBody(modal.typedText);
              modal.setSavedVoiceRecordingId(null);
              modal.setState("transcript");
            }}
            onRecord={() => void modal.beginRecording()}
          />
        ) : null}

        {modal.state === "empty-take" ? (
          <CaptureEmptyTakeState
            onRecord={() => void modal.beginRecording()}
            onType={() => modal.setState("typed")}
          />
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default CaptureLauncherModal;
