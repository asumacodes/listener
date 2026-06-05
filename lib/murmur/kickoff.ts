import { signMurmurRequest } from "@/lib/murmur/sign";

export type KickoffResult =
  | { ok: true; runId: string; status: "running" }
  | {
      ok: false;
      runId: string;
      reason:
        | "invalid_signature"
        | "minutes_exhausted"
        | "bad_response"
        | "unreachable";
      detail?: string;
      httpStatus?: number;
    };

type RunningBody = {
  run_id?: string;
  status: "running";
  error?: unknown;
};

const isRunningBody = (value: unknown): value is RunningBody => {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return body.status === "running" && !("error" in body);
};

export async function kickoff(params: {
  runId: string;
  audioBytes: Uint8Array;
  mimeType: string;
  secret: string;
  bridgeBaseUrl: string;
}): Promise<KickoffResult> {
  const { runId, audioBytes, mimeType, secret, bridgeBaseUrl } = params;

  const signed = await signMurmurRequest(runId, audioBytes, secret);

  const form = new FormData();
  const audioCopy = new Uint8Array(audioBytes);
  form.append("data", new Blob([audioCopy], { type: mimeType }), "audio.webm");
  form.append("run_id", runId);
  form.append("timestamp", String(signed.timestamp));

  const url = `${bridgeBaseUrl.replace(/\/$/, "")}/webhook-test/voice-to-jira`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "X-Murmur-Signature": signed.signatureHeader },
      body: form,
    });
  } catch (e) {
    return { ok: false, runId, reason: "unreachable", detail: String(e) };
  }

  const rawBody = await res.text();

  let parsed: unknown = null;
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as unknown) : null;
  } catch {
    parsed = null;
  }

  if (res.status === 401) {
    return {
      ok: false,
      runId,
      reason: "invalid_signature",
      httpStatus: 401,
      detail: rawBody,
    };
  }

  if (res.status === 422) {
    return {
      ok: false,
      runId,
      reason: "minutes_exhausted",
      httpStatus: 422,
      detail: rawBody,
    };
  }

  if (res.status === 200 && isRunningBody(parsed)) {
    return { ok: true, runId, status: "running" };
  }

  return {
    ok: false,
    runId,
    reason: "bad_response",
    httpStatus: res.status,
    detail: rawBody || "(empty body)",
  };
}
