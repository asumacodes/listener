"use client";

import { useCaptureLauncher } from "@/components/desktop/CaptureLauncherContext";
import useCaptureProject from "@/hooks/useCaptureProject";
import useCaptureRecording from "@/hooks/useCaptureRecording";
import { silentWebmBlob } from "@/lib/media/silent-blob";
import {
  type CaptureAbandonPhase,
  trackAtlassianConnected,
  trackCaptureAbandoned,
  trackCaptureTypedStarted,
  trackRecordingReviewed,
  trackRunBlocked,
  trackRunKickedOff,
} from "@/lib/analytics/events";
import { hasFired, markFired } from "@/lib/analytics/run-fired-guard";
import { startPipelineRun } from "@/lib/murmur/client";
import { saveRecording } from "@/lib/recordings/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type CaptureModalState =
  | "idle"
  | "recording"
  | "review"
  | "transcript"
  | "mic-blocked"
  | "transcribing"
  | "atlassian-gate"
  | "quota"
  | "typed"
  | "empty-take"
  | "run-blocked";

export const CAPTURE_EDGE_STATES: CaptureModalState[] = [
  "mic-blocked",
  "transcribing",
  "atlassian-gate",
  "quota",
  "typed",
  "empty-take",
  "run-blocked",
];

const abandonPhaseFor = (
  state: CaptureModalState
): CaptureAbandonPhase | null => {
  if (state === "quota" || state === "run-blocked") return null;
  if (state === "idle" || state === "mic-blocked" || state === "empty-take") {
    return "launcher_empty";
  }
  if (state === "recording" || state === "review") return "review";
  // transcribing | transcript | typed | atlassian-gate
  return "transcript";
};

/**
 * Orchestrates desktop capture modal state + recording/project hooks.
 * Presentation stays in CaptureLauncherModal / CaptureStates.
 */
const useCaptureModal = () => {
  const { open, closeCapture, initialText, startIn } = useCaptureLauncher();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [state, setState] = useState<CaptureModalState>("idle");
  const [typedText, setTypedText] = useState("");
  const [transcriptBody, setTranscriptBody] = useState("");
  const [kickoffBusy, setKickoffBusy] = useState(false);
  const [kickoffError, setKickoffError] = useState<string | null>(null);
  const project = useCaptureProject(open);
  const recording = useCaptureRecording();
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [savedVoiceRecordingId, setSavedVoiceRecordingId] = useState<
    string | null
  >(null);
  const [wasOpen, setWasOpen] = useState(open);
  const [seededOpen, setSeededOpen] = useState(false);

  const goToState = (
    next: CaptureModalState,
    opts?: { recordingId?: string | null }
  ) => {
    if (next === "typed") {
      trackCaptureTypedStarted("desktop");
    }
    if (next === "review" || next === "transcript") {
      const recordingId =
        opts?.recordingId !== undefined
          ? (opts.recordingId ?? undefined)
          : (savedVoiceRecordingId ?? undefined);
      const guardId = recordingId ?? "pre_save";
      if (!hasFired("recording_reviewed", guardId)) {
        trackRecordingReviewed("desktop", recordingId);
        markFired("recording_reviewed", guardId);
      }
    }
    setState(next);
  };

  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setState("idle");
      setTypedText("");
      setTranscriptBody("");
      setKickoffBusy(false);
      setKickoffError(null);
      setSeededOpen(false);
      setProjectPickerOpen(false);
      setSavedVoiceRecordingId(null);
      recording.discardTake();
      project.reset();
    } else {
      setSeededOpen(false);
    }
  }

  if (open && !seededOpen) {
    setSeededOpen(true);
    if (startIn === "typed") {
      setTypedText(initialText);
      setTranscriptBody(initialText);
      goToState("typed");
    }
  }

  const onDismiss = useCallback(() => {
    const phase = abandonPhaseFor(state);
    if (phase) {
      trackCaptureAbandoned(
        phase,
        "desktop",
        savedVoiceRecordingId ?? undefined
      );
    }
    if (state === "atlassian-gate") {
      void queryClient.invalidateQueries({ queryKey: ["desktop-home-ideas"] });
    }
    recording.discardTake();
    closeCapture();
  }, [closeCapture, queryClient, recording, savedVoiceRecordingId, state]);

  const handoffToHomeGrid = () => {
    closeCapture();
    router.push("/projects");
    router.refresh();
  };

  const startPipeline = async (recordingId: string) => {
    const result = await startPipelineRun(recordingId);
    if (!result.ok) {
      if (result.reason === "out_of_quota") {
        trackRunBlocked("out_of_quota", "initial", "desktop", { recordingId });
        setState("quota");
        return;
      }
      if (result.reason === "atlassian_required") {
        trackRunBlocked("atlassian_required", "initial", "desktop", {
          recordingId,
        });
        setState("atlassian-gate");
        return;
      }
      // No queue yet (one in-flight run per user) — run was NOT created.
      if (result.reason === "run_in_progress") {
        trackRunBlocked("run_in_progress", "initial", "desktop", {
          recordingId,
        });
        setState("run-blocked");
        return;
      }
      if (result.reason === "cost_halt") {
        trackRunBlocked("cost_halt", "initial", "desktop", { recordingId });
      }
      setKickoffError(
        result.reason === "cost_halt"
          ? "New ideas are paused for a little while. Try again later today."
          : "Couldn't start the pipeline. Try again."
      );
      return;
    }
    trackRunKickedOff(result.runId, recordingId, "desktop", false);
    handoffToHomeGrid();
  };

  const runPipeline = async () => {
    if (kickoffBusy) return;
    setKickoffBusy(true);
    setKickoffError(null);
    try {
      if (savedVoiceRecordingId) {
        await startPipeline(savedVoiceRecordingId);
        return;
      }

      const text = transcriptBody.trim() || typedText.trim();
      if (!text) return;
      const { recordingId } = await saveRecording({
        blob: silentWebmBlob(),
        mimeType: "audio/webm",
        durationSeconds: 0,
        transcription: text,
        language: null,
        projectId: project.selectedId ?? undefined,
        surface: "desktop",
      });
      await startPipeline(recordingId);
    } catch {
      setKickoffError(
        savedVoiceRecordingId
          ? "Couldn't start the pipeline. Try again."
          : "Couldn't save this idea. Try again."
      );
    } finally {
      setKickoffBusy(false);
    }
  };

  const beginRecording = async () => {
    setKickoffError(null);
    setSavedVoiceRecordingId(null);
    const started = await recording.startRecording();
    goToState(started ? "recording" : "mic-blocked");
  };

  const stopRecording = async () => {
    const hasAudio = await recording.stopRecording();
    goToState(hasAudio && !recording.isEmptyTake() ? "review" : "empty-take");
  };

  // Hard-cap auto-stop: recorder stops itself and sets audioUrl; adjust
  // modal state during render (same pattern as open/seed resets above).
  if (
    state === "recording" &&
    recording.durationSeconds >= recording.maxSeconds &&
    recording.audioUrl
  ) {
    goToState(recording.isEmptyTake() ? "empty-take" : "review");
  }

  // Popup OAuth success → restore transcript review with Run Pipeline.
  useEffect(() => {
    if (state !== "atlassian-gate") return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.atlassian !== "connected") return;
      trackAtlassianConnected(
        e.data.context === "settings" ? "settings" : "pre_run"
      );
      setKickoffError(null);
      setState("transcript");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [state]);

  const confirmRecording = async () => {
    setState("transcribing");
    const submitted = await recording.submitRecording(
      project.selectedId ?? undefined
    );
    if (!submitted) {
      goToState("review");
      return;
    }
    setTranscriptBody(submitted.text);
    setTypedText(submitted.text);
    setSavedVoiceRecordingId(submitted.recordingId);
    goToState("transcript", { recordingId: submitted.recordingId });
  };

  return {
    open,
    state,
    setState: goToState,
    typedText,
    setTypedText,
    transcriptBody,
    setTranscriptBody,
    kickoffBusy,
    kickoffError,
    project,
    recording,
    projectPickerOpen,
    setProjectPickerOpen,
    savedVoiceRecordingId,
    setSavedVoiceRecordingId,
    onDismiss,
    runPipeline,
    beginRecording,
    stopRecording,
    confirmRecording,
  };
};

export default useCaptureModal;
