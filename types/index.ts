export { AppState } from "./app-state";

export type { AuthActions, AuthState } from "./auth";
export type { EffectiveBalance } from "./billing";
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
  ProjectFormMode,
  ProjectListFormState,
  ProjectListViewProps,
  ProjectPickerViewProps,
  UseProjectPickerOptions,
} from "./project";
export type { RecordingActions, RecordingScreenState } from "./recording-flow";
export type {
  HandoffReason,
  PipelineEventType,
  PipelineRunRow,
  PipelineStage,
  PipelineStatus,
  RunEventRow,
} from "./pipeline";
export {
  isPipelineEventType,
  isPipelineStage,
  isRunEventRow,
  stageLabel,
} from "./pipeline";
export type { SearchResult } from "./search";
export type {
  CaptureIllustrationDefinition,
  CaptureIllustrationId,
  IllustrationId,
  PipelineIllustrationId,
  PipelineIllustrationProps,
  PipelineStageMeta,
} from "./illustration";

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
