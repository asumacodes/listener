// Provider-aware capture-time transcription (ADR-028).
// dev  → whisper    (NEXT_PUBLIC_WHISPER_ENDPOINT, local faster-whisper)
// prod → assemblyai (ASSEMBLYAI_API_KEY)
// Both return { text, language } so callers are provider-blind.

import { transcribeWithAssemblyAI } from "@/lib/assemblyai";
import { NoSpeechError } from "@/lib/transcribe/no-speech";
import { transcribeWithWhisper, type WhisperResult } from "@/lib/whisper";

type Provider = "whisper" | "assemblyai";

const getProvider = (): Provider => {
  const raw = process.env.TRANSCRIPTION_PROVIDER;
  const normalized = (raw ?? "whisper").trim().toLowerCase();
  const provider: Provider =
    normalized === "assemblyai" ? "assemblyai" : "whisper";
  return provider;
};

/** Throws NoSpeechError when the provider completed but heard nothing. */
export const transcribe = async (audio: File): Promise<WhisperResult> => {
  const provider = getProvider();
  const result =
    provider === "assemblyai"
      ? await transcribeWithAssemblyAI(audio)
      : await transcribeWithWhisper(audio);
  // Empty-after-trim only — no length heuristic; one word is a valid idea.
  if (result.text.trim() === "") {
    throw new NoSpeechError(`${provider} returned an empty transcript`);
  }
  return result;
};
