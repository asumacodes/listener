// No-speech detection shared by /api/transcribe, the run gate, and idea lists.
// Detection is structural (empty text / provider "no spoken audio" error) —
// never a length heuristic: a one-word transcript is a valid idea.

/** Wire code on /api/transcribe 422 responses. */
export const NO_SPEECH_CODE = "no_speech";

/** Provider returned no usable speech (empty transcript or explicit no-audio error). */
export class NoSpeechError extends Error {
  constructor(message = "No speech detected") {
    super(message);
    this.name = "NoSpeechError";
  }
}

export const isNoSpeechError = (error: unknown): error is NoSpeechError =>
  error instanceof NoSpeechError;

/** AssemblyAI's error for silent/music-only audio when language_detection is on. */
export const isNoSpokenAudioProviderError = (message: string): boolean =>
  /no spoken audio/i.test(message);

/**
 * Pre-fix placeholder that lib/transcribe/client.ts saved in place of an empty
 * transcript. Legacy rows only — nothing writes it anymore.
 */
const LEGACY_EMPTY_PLACEHOLDER = "Nothing was transcribed.";

/** True when a saved recording has no real transcript to run the pipeline on. */
export const isUnusableTranscript = (
  transcription: string | null | undefined
): boolean => {
  const text = transcription?.trim() ?? "";
  return text === "" || text.startsWith(LEGACY_EMPTY_PLACEHOLDER);
};
