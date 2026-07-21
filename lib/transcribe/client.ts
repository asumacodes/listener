import { TranscriptionError } from "@/lib/errors";

export type TranscriptionResult = {
  text: string;
  language: string | null;
  assemblyaiUsd?: number;
  assemblyaiDurationSeconds?: number;
  transcriptReadyAt?: string;
};

const EMPTY_TRANSCRIPTION =
  "Nothing was transcribed. Try speaking closer to your microphone.";

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
    throw new TranscriptionError(`HTTP ${res.status}`, "HTTP_ERROR");
  }

  const {
    text,
    language,
    assemblyaiUsd,
    assemblyaiDurationSeconds,
    transcriptReadyAt,
  } = await res.json();
  return {
    text: text?.trim() || EMPTY_TRANSCRIPTION,
    language: language ?? null,
    assemblyaiUsd,
    assemblyaiDurationSeconds,
    transcriptReadyAt,
  };
};
