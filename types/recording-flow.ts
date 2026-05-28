import type { AppState } from "./app-state";
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
};

export type RecordingActions = {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  submitRecording: () => Promise<void>;
  handleReRecord: () => void;
};
