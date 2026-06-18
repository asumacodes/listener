// lib/crypto/atlassian-tokens.ts
//
// App-level envelope encryption for Atlassian OAuth tokens at rest.
// AES-256-GCM (authenticated: tampering is detected on decrypt). Random IV per
// call. SERVER-ONLY - imports node:crypto and reads a server env key. Never
// import this from a component, hook, or anything client-bundled.
//
// Stored format: "<iv_b64>:<ciphertext_b64>:<authTag_b64>"

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12; // GCM standard nonce length

function getKey(): Buffer {
  const raw = process.env.ATLASSIAN_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ATLASSIAN_TOKEN_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `ATLASSIAN_TOKEN_ENCRYPTION_KEY must decode to 32 bytes (got ${key.length})`
    );
  }
  return key;
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    ciphertext.toString("base64"),
    authTag.toString("base64"),
  ].join(":");
}

export function decryptToken(stored: string): string {
  const key = getKey();
  const [ivB64, ctB64, tagB64] = stored.split(":");
  if (!ivB64 || !ctB64 || !tagB64) {
    throw new Error("malformed ciphertext");
  }
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(), // throws if authTag doesn't match - tamper detection
  ]);
  return plaintext.toString("utf8");
}
