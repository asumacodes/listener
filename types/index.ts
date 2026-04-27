export enum AppState {
  IDLE = "idle",
  RECORDING = "recording",
  STOPPED = "stopped",
  SUBMITTING = "submitting",
  DONE = "done",
  ERROR = "error",
}

export interface RecordingState {
  appState: AppState;
  elapsedSeconds: number;
  transcription: string;
  errorMessage: string;
}
