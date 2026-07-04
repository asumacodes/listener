// Capture-time transcription via AssemblyAI async API (ADR-028).
// Three steps: upload raw bytes → submit job → poll until completed/error.
// Auth is a raw `authorization` header (the API key value directly, NOT Bearer).
// Shape mirrors transcribeWithWhisper so /api/transcribe is provider-blind.

import { requireEnv } from "@/lib/env";
import type { WhisperResult } from "@/lib/whisper";

const ASSEMBLYAI_BASE = "https://api.assemblyai.com";

const maskKey = (key: string) => {
  if (key.length <= 8) return `(len=${key.length})`;
  return `${key.slice(0, 4)}…${key.slice(-4)} (len=${key.length})`;
};

const keyDebug = (key: string) => ({
  mask: maskKey(key),
  len: key.length,
  hasBearerPrefix: /^bearer\s/i.test(key),
  hasWhitespace: /\s/.test(key),
  firstCharCode: key.charCodeAt(0),
  lastCharCode: key.charCodeAt(key.length - 1),
});

const getAssemblyAiKey = (): string => requireEnv("ASSEMBLYAI_API_KEY").trim();

export const transcribeWithAssemblyAI = async (
  audio: File
): Promise<WhisperResult> => {
  const apiKey = getAssemblyAiKey();
  console.log("[assemblyai] start", {
    key: keyDebug(apiKey),
    audio: {
      name: audio.name,
      type: audio.type,
      size: audio.size,
    },
  });

  // 1. Upload raw audio bytes → { upload_url }
  // Buffer the file: File.stream() + duplex is unreliable in Next route handlers.
  const audioBytes = Buffer.from(await audio.arrayBuffer());
  console.log("[assemblyai] upload →", `${ASSEMBLYAI_BASE}/v2/upload`, {
    bytes: audioBytes.byteLength,
  });

  const uploadRes = await fetch(`${ASSEMBLYAI_BASE}/v2/upload`, {
    method: "POST",
    headers: {
      authorization: apiKey,
      "content-type": "application/octet-stream",
    },
    body: audioBytes,
  });

  console.log("[assemblyai] upload ←", uploadRes.status, uploadRes.statusText);

  if (!uploadRes.ok) {
    const detail = await uploadRes.text().catch(() => "");
    console.error("[assemblyai] upload body:", detail.slice(0, 500));
    throw new Error(
      `AssemblyAI upload failed: ${uploadRes.status} ${uploadRes.statusText}${
        detail ? ` — ${detail.slice(0, 200)}` : ""
      }`
    );
  }

  const uploadJson = (await uploadRes.json()) as { upload_url?: string };
  const upload_url = uploadJson.upload_url;
  console.log("[assemblyai] upload_url present:", Boolean(upload_url));

  if (!upload_url) {
    throw new Error("AssemblyAI upload returned no upload_url");
  }

  // 2. Submit transcription job → { id }
  console.log("[assemblyai] submit →", `${ASSEMBLYAI_BASE}/v2/transcript`);
  const submitRes = await fetch(`${ASSEMBLYAI_BASE}/v2/transcript`, {
    method: "POST",
    headers: {
      authorization: apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_detection: true,
    }),
  });

  console.log("[assemblyai] submit ←", submitRes.status, submitRes.statusText);

  if (!submitRes.ok) {
    const detail = await submitRes.text().catch(() => "");
    console.error("[assemblyai] submit body:", detail.slice(0, 500));
    throw new Error(
      `AssemblyAI submit failed: ${submitRes.status} ${submitRes.statusText}${
        detail ? ` — ${detail.slice(0, 200)}` : ""
      }`
    );
  }

  const { id } = (await submitRes.json()) as { id: string };
  console.log("[assemblyai] transcript id:", id);
  if (!id) {
    throw new Error("AssemblyAI submit returned no transcript id");
  }

  // 3. Poll until completed / error
  const maxAttempts = 40; // 40 * 3s = 120s ceiling (interactive capture-time)
  const intervalMs = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pollRes = await fetch(`${ASSEMBLYAI_BASE}/v2/transcript/${id}`, {
      method: "GET",
      headers: { authorization: apiKey },
    });

    if (!pollRes.ok) {
      const detail = await pollRes.text().catch(() => "");
      console.error("[assemblyai] poll body:", detail.slice(0, 500));
      throw new Error(
        `AssemblyAI poll failed: ${pollRes.status} ${pollRes.statusText}${
          detail ? ` — ${detail.slice(0, 200)}` : ""
        }`
      );
    }

    const result = (await pollRes.json()) as {
      status: string;
      text?: string;
      language_code?: string;
      error?: string;
    };

    console.log("[assemblyai] poll", {
      attempt: attempt + 1,
      status: result.status,
      language_code: result.language_code,
      textLen: result.text?.length ?? 0,
      error: result.error,
    });

    if (result.status === "completed") {
      console.log("[assemblyai] completed");
      return {
        text: result.text ?? "",
        language: result.language_code ?? "",
      };
    }

    if (result.status === "error") {
      throw new Error(
        `AssemblyAI transcription error: ${result.error ?? "unknown"}`
      );
    }

    // queued | processing → wait and retry
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `AssemblyAI transcription timed out after ${maxAttempts} attempts`
  );
};
