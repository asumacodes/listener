import { TranscriptionError } from "@/lib/errors";
import { NO_SPEECH_CODE } from "@/lib/transcribe/no-speech";

export type TranscriptionResult = {
  text: string;
  language: string | null;
  assemblyaiUsd?: number;
  assemblyaiDurationSeconds?: number;
  transcriptReadyAt?: string;
};

/**
 * Throws TranscriptionError("NO_SPEECH") when nothing was heard — callers must
 * not save or offer a pipeline run for an empty transcript.
 */
export const transcribeAudio = async (
  blob: Blob,
  filename: string
): Promise<TranscriptionResult> => {
  const formData = new FormData();
  formData.append("audio", blob, filename);

  let res: Response;
  try {
    res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new TranscriptionError("Whisper endpoint unreachable", "UNREACHABLE");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      code?: unknown;
    } | null;
    if (res.status === 422 && body?.code === NO_SPEECH_CODE) {
      throw new TranscriptionError("No speech detected", "NO_SPEECH");
    }
    throw new TranscriptionError(`HTTP ${res.status}`, "HTTP_ERROR");
  }

  const {
    text,
    language,
    assemblyaiUsd,
    assemblyaiDurationSeconds,
    transcriptReadyAt,
  } = await res.json();
  const trimmed = typeof text === "string" ? text.trim() : "";
  // Server already 422s on empty; guard anyway so no path saves "".
  if (!trimmed) {
    throw new TranscriptionError("Empty transcript", "NO_SPEECH");
  }
  return {
    text: trimmed,
    language: language ?? null,
    assemblyaiUsd,
    assemblyaiDurationSeconds,
    transcriptReadyAt,
  };
};
