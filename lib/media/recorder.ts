export const MAX_RECORDING_SECONDS = 120;

// Pick the best supported MIME type for this browser.
// Order matters: webm/opus on Chrome+Android+Edge, mp4/aac on iOS Safari.
// Verify on a physical iPhone over HTTPS (preview deploy): record → transcribe → playback.
export const pickAudioMime = (): string => {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
};

/** Strip codec parameter — storage wants "audio/webm" not "audio/webm;codecs=opus". */
export const cleanBlobMime = (rawMime: string): string =>
  rawMime.split(";")[0] || "audio/webm";

export const resolveBlobMime = (
  recorderMime: string,
  chosenMime: string
): string => cleanBlobMime(recorderMime || chosenMime || "audio/webm");

const MIME_TO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
};

export const mimeToExtension = (mime: string): string =>
  MIME_TO_EXT[mime] ?? "webm";

export const recordingFilenameForMime = (blobMime: string): string =>
  `recording.${mimeToExtension(blobMime)}`;
