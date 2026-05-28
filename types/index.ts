export { AppState } from "./app-state";

export type { AuthActions, AuthState } from "./auth";
export type {
  ListRecordingsResult,
  RecordingRow,
  RecordingWithPlayback,
  SaveRecordingArgs,
  SaveRecordingResult,
} from "./recording";
export type {
  ProjectDeleteTarget,
  ProjectDetailHeader,
  ProjectDetailRecording,
  ProjectDetailViewProps,
  ProjectListViewProps,
  ProjectPickerViewProps,
  UseProjectPickerOptions,
} from "./project";
export type { RecordingActions, RecordingScreenState } from "./recording-flow";

export type AuthMode = "signin" | "signup";

export type OAuthProvider = "google" | "github";

import { AppState } from "./app-state";

export interface RecordingState {
  appState: AppState;
  elapsedSeconds: number;
  transcription: string;
  errorMessage: string;
  language: string | null;
  recordedAt: Date | null;
}
