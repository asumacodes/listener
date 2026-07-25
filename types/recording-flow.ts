import type { AppState } from "./app-state";
import type { HandoffReason, PipelineStage } from "./pipeline";
import type { RunResults } from "./run-results";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

export type RecordingScreenState = {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  errorMessage: string | null;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  elapsedSeconds: number;
  setElapsedSeconds: Dispatch<SetStateAction<number>>;
  transcription: string | null;
  setTranscription: Dispatch<SetStateAction<string | null>>;
  language: string | null;
  setLanguage: Dispatch<SetStateAction<string | null>>;
  recordedAt: Date | null;
  setRecordedAt: Dispatch<SetStateAction<Date | null>>;
  recordingStream: MediaStream | null;
  setRecordingStream: Dispatch<SetStateAction<MediaStream | null>>;
  streamRef: MutableRefObject<MediaStream | null>;
  mediaRecorderRef: MutableRefObject<MediaRecorder | null>;
  chunksRef: MutableRefObject<BlobPart[]>;
  audioBlobRef: MutableRefObject<Blob | null>;
  audioUrl: string | null;
  setAudioUrl: Dispatch<SetStateAction<string | null>>;
  timerRef: MutableRefObject<NodeJS.Timeout | null>;
  elapsedSecondsRef: MutableRefObject<number>;
  savedRecordingId: string | null;
  setSavedRecordingId: Dispatch<SetStateAction<string | null>>;
  currentProjectId: string | null;
  setCurrentProjectId: Dispatch<SetStateAction<string | null>>;
  currentProjectIsDefault: boolean;
  setCurrentProjectIsDefault: Dispatch<SetStateAction<boolean>>;
  runId: string | null;
  setRunId: Dispatch<SetStateAction<string | null>>;
  pipelineStage: PipelineStage | null;
  setPipelineStage: Dispatch<SetStateAction<PipelineStage | null>>;
  handoffReason: HandoffReason | null;
  setHandoffReason: Dispatch<SetStateAction<HandoffReason | null>>;
  pipelineError: string | null;
  setPipelineError: Dispatch<SetStateAction<string | null>>;
  longerHint: boolean;
  setLongerHint: Dispatch<SetStateAction<boolean>>;
  runResults: RunResults | null;
  setRunResults: Dispatch<SetStateAction<RunResults | null>>;
  /** Active run blocking a new kickoff; sheet shown when non-null. */
  concurrentActiveRunId: string | null;
  setConcurrentActiveRunId: Dispatch<SetStateAction<string | null>>;
  /** Free-tier wall; OutOfQuotaSheet shown when true. */
  outOfQuotaOpen: boolean;
  setOutOfQuotaOpen: Dispatch<SetStateAction<boolean>>;
};

export type RecordingActions = {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  submitRecording: () => Promise<void>;
  handleReRecord: () => void;
  kickoffPipeline: (recordingId: string) => Promise<void>;
  retryHandoff: () => Promise<void>;
  retryPipeline: () => Promise<void>;
  resumePipeline: (resumeRunId: string) => Promise<void>;
};
