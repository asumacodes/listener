export type RecordingSaveErrorCode =
  | "NOT_AUTHENTICATED"
  | "DEFAULT_PROJECT_MISSING"
  | "STORAGE_UPLOAD_FAILED"
  | "INSERT_FAILED";

export class RecordingSaveError extends Error {
  readonly code: RecordingSaveErrorCode;

  constructor(message: string, code: RecordingSaveErrorCode) {
    super(message);
    this.name = "RecordingSaveError";
    this.code = code;
  }
}

export class TranscriptionError extends Error {
  readonly code: "HTTP_ERROR" | "UNREACHABLE";

  constructor(message: string, code: "HTTP_ERROR" | "UNREACHABLE") {
    super(message);
    this.name = "TranscriptionError";
    this.code = code;
  }
}

export const isRecordingSaveError = (
  error: unknown
): error is RecordingSaveError => error instanceof RecordingSaveError;

export const isTranscriptionError = (
  error: unknown
): error is TranscriptionError => error instanceof TranscriptionError;

export const OFFLINE_MESSAGE =
  "You're offline — connect to transcribe and save.";

const TRANSCRIPTION_ERROR_MESSAGE =
  "Transcription couldn't complete on this device. Check your microphone permissions and try recording again.";

const SAVE_ERROR_MESSAGE =
  "Transcription succeeded but we couldn't save it. Check your connection and try again.";

const GENERIC_RECORDING_ERROR_MESSAGE =
  "Unable to start recording. Check your microphone permissions and try again.";

const isOffline = () => typeof navigator !== "undefined" && !navigator.onLine;

/** Map thrown errors from lib/ to user-facing copy for the recorder UI. */
export const toUserMessage = (error: unknown): string => {
  if (isOffline()) {
    return OFFLINE_MESSAGE;
  }
  if (isRecordingSaveError(error)) {
    return SAVE_ERROR_MESSAGE;
  }
  if (isTranscriptionError(error)) {
    if (error.code === "UNREACHABLE") {
      return OFFLINE_MESSAGE;
    }
    return TRANSCRIPTION_ERROR_MESSAGE;
  }
  return TRANSCRIPTION_ERROR_MESSAGE;
};

/** Map getUserMedia / MediaRecorder failures to user-facing copy. */
export const microphoneErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Microphone access is required. Check your permissions and try recording again.";
    }
    if (error.name === "NotFoundError") {
      return "No microphone found. Connect a microphone and try recording again.";
    }
    if (error.name === "NotSupportedError") {
      return "Recording isn't supported in this browser. Try Safari on iOS or Chrome on desktop.";
    }
    return `Microphone error: ${error.message}. Try recording again.`;
  }
  return GENERIC_RECORDING_ERROR_MESSAGE;
};
