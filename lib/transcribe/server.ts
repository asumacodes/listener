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
  console.log("[transcribe/server] provider", {
    raw,
    normalized,
    provider,
    hasAssemblyAiKey: Boolean(process.env.ASSEMBLYAI_API_KEY?.trim()),
    assemblyAiKeyLen: process.env.ASSEMBLYAI_API_KEY?.trim().length ?? 0,
    hasWhisperEndpoint: Boolean(process.env.NEXT_PUBLIC_WHISPER_ENDPOINT),
  });
  return provider;
};

export const transcribe = async (audio: File): Promise<WhisperResult> => {
  const provider = getProvider();
  console.log("[transcribe/server] dispatch", {
    provider,
    audioName: audio.name,
    audioType: audio.type,
    audioSize: audio.size,
  });
  return provider === "assemblyai"
    ? transcribeWithAssemblyAI(audio)
    : transcribeWithWhisper(audio);
};
