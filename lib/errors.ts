export type RecordingSaveErrorCode =
  | "NOT_AUTHENTICATED"
  | "DEFAULT_PROJECT_MISSING"
  | "PROVISIONING_FAILED"
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

const AUTH_OTP_RATE_LIMIT = "Too many codes sent. Wait a minute and try again.";
const AUTH_OTP_INVALID = "That code didn't work. Check it and try again.";
const AUTH_OTP_EXPIRED = "That code expired. Request a new one.";
const AUTH_SMS_FAILED =
  "We couldn't send a text right now. Check the number and try again.";
const AUTH_CAPTCHA_FAILED =
  "Verification failed. Refresh the page and try again.";
const AUTH_CAPTCHA_MISCONFIGURED =
  "Sign-in protection is misconfigured. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY or turn CAPTCHA off in Supabase.";
const AUTH_PHONE_INVALID = "Enter a valid mobile number.";
const AUTH_PROVISION_FAILED =
  "We couldn't finish creating your account. Try again in a moment.";
const AUTH_GENERIC = "Sign-in failed. Try again.";

const AUTH_IDENTITY_EXISTS =
  "This Google or GitHub account is already linked to another Listener account. Sign in with that account, or link a different one.";
const AUTH_MANUAL_LINKING_DISABLED =
  "Account linking isn’t enabled yet. Turn on Manual linking in Supabase Auth settings.";
const AUTH_UNLINK_LAST = "Keep at least one sign-in method on your account.";
const AUTH_LINK_GENERIC = "We couldn’t link that account. Try again.";

const authErrorCode = (error: unknown): string => {
  if (!error || typeof error !== "object") return "";
  const record = error as {
    code?: unknown;
    message?: unknown;
    status?: unknown;
  };
  if (typeof record.code === "string") return record.code.toLowerCase();
  return "";
};

const authErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") return "";
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message.toLowerCase() : "";
};

/** Map Supabase Auth phone OTP errors to user-facing copy. */
export const phoneAuthErrorMessage = (error: unknown): string => {
  const code = authErrorCode(error);
  const message = authErrorMessage(error);

  if (
    code === "over_sms_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    message.includes("rate limit") ||
    message.includes("security purposes")
  ) {
    return AUTH_OTP_RATE_LIMIT;
  }
  // Send-failure before verify: sms_send_failed messages contain "OTP" and
  // used to fall through to AUTH_OTP_INVALID ("That code didn't work").
  if (
    code === "sms_send_failed" ||
    message.includes("sms") ||
    message.includes("twilio") ||
    message.includes("error sending")
  ) {
    return AUTH_SMS_FAILED;
  }
  if (
    code === "otp_expired" ||
    message.includes("otp_expired") ||
    message.includes("expired")
  ) {
    return AUTH_OTP_EXPIRED;
  }
  if (code === "captcha_failed" || message.includes("captcha")) {
    if (
      message.includes("no captcha_token") ||
      message.includes("captcha_token")
    ) {
      return AUTH_CAPTCHA_MISCONFIGURED;
    }
    return AUTH_CAPTCHA_FAILED;
  }
  if (
    code === "invalid_credentials" ||
    message.includes("token has expired") ||
    message.includes("invalid token")
  ) {
    return AUTH_OTP_INVALID;
  }
  if (
    code === "unexpected_failure" ||
    message.includes("database error saving new user") ||
    message.includes("database error")
  ) {
    return AUTH_PROVISION_FAILED;
  }
  return AUTH_GENERIC;
};

export const phoneFormatErrorMessage = (): string => AUTH_PHONE_INVALID;

/** Map identity link / unlink failures to user-facing copy. */
export const identityLinkErrorMessage = (error: unknown): string => {
  const code = authErrorCode(error);
  const message = authErrorMessage(error);
  const raw =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === "string"
        ? error.toLowerCase()
        : "";

  if (
    code === "identity_already_exists" ||
    message.includes("identity_already_exists") ||
    message.includes("already been linked") ||
    message.includes("already linked") ||
    raw.includes("identity_already_exists")
  ) {
    return AUTH_IDENTITY_EXISTS;
  }
  if (
    code === "manual_linking_disabled" ||
    message.includes("manual_linking") ||
    raw.includes("manual_linking")
  ) {
    return AUTH_MANUAL_LINKING_DISABLED;
  }
  if (
    code === "single_identity_not_deletable" ||
    message.includes("single_identity") ||
    raw.includes("single_identity_not_deletable")
  ) {
    return AUTH_UNLINK_LAST;
  }
  return AUTH_LINK_GENERIC;
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
