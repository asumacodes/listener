/** Derive a 6-word title from transcription. Falls back to a timestamp if empty. */
export const autoTitle = (transcription: string): string => {
  const cleaned = transcription.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return `Recording ${new Date().toLocaleString()}`;
  }
  const words = cleaned.split(" ").slice(0, 6).join(" ");
  return words.replace(/[.,;:!?…]+$/, "");
};
