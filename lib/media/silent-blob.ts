/**
 * Minimal placeholder audio for typed-capture saves.
 * Schema requires `audio_storage_path`; no SQL change — upload a tiny webm stub.
 */
export const silentWebmBlob = (): Blob =>
  new Blob([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])], { type: "audio/webm" });
