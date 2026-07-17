import { signMurmurRequest, signMurmurResumeRequest } from "@/lib/murmur/sign";

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

/** `webhook` (prod) or `webhook-test` (n8n — requires Execute workflow). */
const bridgeWebhookPrefix = (): string => {
  const prefix = process.env.MURMUR_WEBHOOK_PREFIX?.trim();
  return prefix === "webhook-test" ? "webhook-test" : "webhook";
};

const interpretKickoffResponse = async (
  res: Response,
  runId: string
): Promise<KickoffResult> => {
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

  const url = `${bridgeBaseUrl.replace(/\/$/, "")}/${bridgeWebhookPrefix()}/voice-to-jira`;

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

  return interpretKickoffResponse(res, runId);
}

/** HMAC v2 resume handoff — sibling of kickoff so the v1 path stays untouched. */
export async function kickoffResume(params: {
  runId: string;
  audioBytes: Uint8Array;
  mimeType: string;
  secret: string;
  bridgeBaseUrl: string;
  fromStage: string;
  resumeRunId: string;
}): Promise<KickoffResult> {
  const {
    runId,
    audioBytes,
    mimeType,
    secret,
    bridgeBaseUrl,
    fromStage,
    resumeRunId,
  } = params;

  const signed = await signMurmurResumeRequest(
    runId,
    audioBytes,
    secret,
    fromStage,
    resumeRunId
  );

  const form = new FormData();
  const audioCopy = new Uint8Array(audioBytes);
  form.append("data", new Blob([audioCopy], { type: mimeType }), "audio.webm");
  form.append("run_id", runId);
  form.append("timestamp", String(signed.timestamp));
  form.append("from_stage", fromStage);
  form.append("resume_run_id", resumeRunId);

  const url = `${bridgeBaseUrl.replace(/\/$/, "")}/${bridgeWebhookPrefix()}/voice-to-jira`;

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

  return interpretKickoffResponse(res, runId);
}
