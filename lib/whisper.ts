import { getWhisperEndpoint } from "@/lib/env";

export type WhisperResult = {
  text: string;
  language: string;
};

/** FastAPI whisper_server.py exposes POST /asr with form field `audio_file`. */
export const getWhisperTranscribeUrl = (): string => {
  const base = getWhisperEndpoint().replace(/\/$/, "");
  return base.endsWith("/asr") ? base : `${base}/asr`;
};

export const transcribeWithWhisper = async (
  audio: File
): Promise<WhisperResult> => {
  const url = getWhisperTranscribeUrl();
  const whisperForm = new FormData();
  whisperForm.append("audio_file", audio, audio.name);

  const response = await fetch(url, {
    method: "POST",
    body: whisperForm,
  });

  if (!response.ok) {
    throw new Error(
      `Whisper returned ${response.status} (check ${url} is running)`
    );
  }

  const result = await response.json();
  return {
    text: result.text ?? "",
    language: result.language ?? "",
  };
};
