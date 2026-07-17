// lib/murmur/sign.ts
//
// Sender-side HMAC v1 signing for the Listener → Bridge webhook call.
// Implements the "Bridge Webhook Auth Contract (HMAC v1)" Confluence page exactly:
//   signing base : v1:{run_id}:{timestamp}:{sha256_hex_of_audio_bytes}
//   signature    : HMAC-SHA256(signing_base, MURMUR_HMAC_SECRET), lowercase hex
//   header value : v1=<hex>
//
// Pure logic only — no env reads, no network, no I/O. The route handler supplies
// the secret and the audio bytes. ("hooks orchestrate, lib executes" — this is lib.)

const SCHEME = "v1";

/** Convert an ArrayBuffer / TypedArray to lowercase hex. */
function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  // Build hex without a per-byte function-call hotspot.
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/** Lowercase hex SHA-256 of the raw audio bytes — the 4th field of the signing base. */
export async function sha256Hex(audioBytes: Uint8Array): Promise<string> {
  // Copy into a fresh ArrayBuffer; some runtimes reject SharedArrayBuffer-backed views.
  const copy = new Uint8Array(audioBytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return toHex(digest);
}

/** True UTC Unix seconds. The contract's gotcha: never a local-time source. */
export function unixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/** Build the exact canonical string both sides hash. Single-colon separators. */
export function buildSigningBase(
  runId: string,
  timestamp: number | string,
  audioSha256Hex: string
): string {
  return `${SCHEME}:${runId}:${timestamp}:${audioSha256Hex}`;
}

/** HMAC-SHA256(signingBase, secret) → lowercase hex. */
export async function hmacSha256Hex(
  signingBase: string,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signingBase));
  return toHex(sig);
}

export interface SignedRequest {
  runId: string;
  timestamp: number;
  audioSha256: string;
  signingBase: string;
  /** The full header value, including the `v1=` prefix. */
  signatureHeader: string;
}

/**
 * One-shot: given a run_id, the audio bytes, and the secret, produce everything
 * the request needs. Generates the timestamp internally (true UTC) unless one is
 * supplied (useful for deterministic tests).
 */
export async function signMurmurRequest(
  runId: string,
  audioBytes: Uint8Array,
  secret: string,
  timestamp: number = unixTimestamp()
): Promise<SignedRequest> {
  if (!secret) throw new Error("MURMUR_HMAC_SECRET is missing");
  const audioSha256 = await sha256Hex(audioBytes);
  const signingBase = buildSigningBase(runId, timestamp, audioSha256);
  const hex = await hmacSha256Hex(signingBase, secret);
  return {
    runId,
    timestamp,
    audioSha256,
    signingBase,
    signatureHeader: `${SCHEME}=${hex}`,
  };
}

// --- HMAC v2 resume signing (ADR-032(f)) ------------------------------------
// Signing base: v2:{run_id}:{timestamp}:{audio_hash}:{from_stage}:{resume_run_id}
// Header value: v2=<hex>
const SCHEME_V2 = "v2";

export function buildResumeSigningBase(
  runId: string,
  timestamp: number | string,
  audioSha256Hex: string,
  fromStage: string,
  resumeRunId: string
): string {
  return `${SCHEME_V2}:${runId}:${timestamp}:${audioSha256Hex}:${fromStage}:${resumeRunId}`;
}

export interface SignedResumeRequest {
  runId: string;
  timestamp: number;
  audioSha256: string;
  fromStage: string;
  resumeRunId: string;
  signingBase: string;
  /** The full header value, including the `v2=` prefix. */
  signatureHeader: string;
}

/**
 * Resume handoff signer. Same crypto helpers as v1; only the base and header
 * prefix differ. from_stage and resume_run_id must match the FormData fields
 * the Bridge Verify HMAC node folds into its v2 base.
 */
export async function signMurmurResumeRequest(
  runId: string,
  audioBytes: Uint8Array,
  secret: string,
  fromStage: string,
  resumeRunId: string,
  timestamp: number = unixTimestamp()
): Promise<SignedResumeRequest> {
  if (!secret) throw new Error("MURMUR_HMAC_SECRET is missing");
  const audioSha256 = await sha256Hex(audioBytes);
  const signingBase = buildResumeSigningBase(
    runId,
    timestamp,
    audioSha256,
    fromStage,
    resumeRunId
  );
  const hex = await hmacSha256Hex(signingBase, secret);
  return {
    runId,
    timestamp,
    audioSha256,
    fromStage,
    resumeRunId,
    signingBase,
    signatureHeader: `${SCHEME_V2}=${hex}`,
  };
}

// --- Broker token-request signing (Bridge -> Listener, no audio) -------------
// Distinct signing base so a token request can never be confused with an audio
// handoff: v1:token:{run_id}:{timestamp}
export function buildBrokerSigningBase(
  runId: string,
  timestamp: number | string
): string {
  return `${SCHEME}:token:${runId}:${timestamp}`;
}

/**
 * Verify an inbound broker request signature. Constant-time compare, with a
 * freshness window to blunt replay. Returns true only if the signature matches
 * and the timestamp is within `windowSeconds` of now.
 */
export async function verifyBrokerSignature(params: {
  runId: string;
  timestamp: number | string;
  signatureHeader: string; // "v1=<hex>"
  secret: string;
  windowSeconds?: number;
}): Promise<boolean> {
  const { runId, timestamp, signatureHeader, secret } = params;
  const windowSeconds = params.windowSeconds ?? 300;

  const ts =
    typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  if (!Number.isFinite(ts)) return false;
  const now = unixTimestamp();
  if (Math.abs(now - ts) > windowSeconds) return false;

  const expected = `${SCHEME}=${await hmacSha256Hex(
    buildBrokerSigningBase(runId, ts),
    secret
  )}`;

  // Constant-time-ish compare (lengths equal -> compare every char).
  if (signatureHeader.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signatureHeader.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
