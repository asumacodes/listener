// Provider-aware capture-time transcription (ADR-028).
// dev  → whisper    (NEXT_PUBLIC_WHISPER_ENDPOINT, local faster-whisper)
// prod → assemblyai (ASSEMBLYAI_API_KEY)
// Both return { text, language } so callers are provider-blind.

import { transcribeWithAssemblyAI } from "@/lib/assemblyai";
import { transcribeWithWhisper, type WhisperResult } from "@/lib/whisper";

type Provider = "whisper" | "assemblyai";

const getProvider = (): Provider => {
  const raw = process.env.TRANSCRIPTION_PROVIDER;
  const normalized = (raw ?? "whisper").trim().toLowerCase();
  const provider: Provider =
    normalized === "assemblyai" ? "assemblyai" : "whisper";
  return provider;
};

export const transcribe = async (audio: File): Promise<WhisperResult> => {
  const provider = getProvider();
  return provider === "assemblyai"
    ? transcribeWithAssemblyAI(audio)
    : transcribeWithWhisper(audio);
};
