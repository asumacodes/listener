"use client";

import { useCaptureLauncher } from "@/components/desktop/CaptureLauncherContext";
import useCaptureProject from "@/hooks/useCaptureProject";
import useCaptureRecording from "@/hooks/useCaptureRecording";
import { silentWebmBlob } from "@/lib/media/silent-blob";
import {
  trackAtlassianConnected,
  trackRunKickedOff,
} from "@/lib/analytics/events";
import { startPipelineRun } from "@/lib/murmur/client";
import { saveRecording } from "@/lib/recordings/client";
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

/**
 * Orchestrates desktop capture modal state + recording/project hooks.
 * Presentation stays in CaptureLauncherModal / CaptureStates.
 */
const useCaptureModal = () => {
  const { open, closeCapture, initialText, startIn } = useCaptureLauncher();
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
      setState("typed");
    }
  }

  const onDismiss = useCallback(() => {
    recording.discardTake();
    closeCapture();
  }, [closeCapture, recording]);

  const handoffToHomeGrid = () => {
    closeCapture();
    router.push("/projects");
    router.refresh();
  };

  const startPipeline = async (recordingId: string) => {
    const result = await startPipelineRun(recordingId);
    if (!result.ok) {
      if (result.reason === "out_of_quota") {
        setState("quota");
        return;
      }
      if (result.reason === "atlassian_required") {
        setState("atlassian-gate");
        return;
      }
      // No queue yet (one in-flight run per user) — run was NOT created.
      if (result.reason === "run_in_progress") {
        setState("run-blocked");
        return;
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
    setState(started ? "recording" : "mic-blocked");
  };

  const stopRecording = async () => {
    const hasAudio = await recording.stopRecording();
    setState(hasAudio && !recording.isEmptyTake() ? "review" : "empty-take");
  };

  // Hard-cap auto-stop: recorder stops itself and sets audioUrl; adjust
  // modal state during render (same pattern as open/seed resets above).
  if (
    state === "recording" &&
    recording.durationSeconds >= recording.maxSeconds &&
    recording.audioUrl
  ) {
    setState(recording.isEmptyTake() ? "empty-take" : "review");
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
      setState("review");
      return;
    }
    setTranscriptBody(submitted.text);
    setTypedText(submitted.text);
    setSavedVoiceRecordingId(submitted.recordingId);
    setState("transcript");
  };

  return {
    open,
    state,
    setState,
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
