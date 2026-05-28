import { getWhisperEndpoint } from "@/lib/env";

export type WhisperResult = {
  text: string;
  language: string;
};

export const transcribeWithWhisper = async (
  audio: File
): Promise<WhisperResult> => {
  const whisperForm = new FormData();
  whisperForm.append("audio_file", audio, audio.name);

  const response = await fetch(getWhisperEndpoint(), {
    method: "POST",
    body: whisperForm,
  });

  if (!response.ok) {
    throw new Error(
      `Whisper returned ${response.status} (check ${getWhisperEndpoint()} is running)`
    );
  }

  const result = await response.json();
  return {
    text: result.text ?? "",
    language: result.language ?? "",
  };
};
