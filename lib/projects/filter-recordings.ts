// KAN-38 item 2 (B1): client-side filter for a project's already-loaded
// recordings. Pure, case-insensitive substring over title + transcription —
// matches what the /search tab searches (title + transcription), but in-memory
// against the project's own set (no RPC, no fetch). Input is already loaded by
// getProjectWithRecordings; this only narrows the array.

import type { ProjectDetailRecording } from "@/types/project";

export const filterRecordingsByQuery = (
  recordings: ProjectDetailRecording[],
  query: string
): ProjectDetailRecording[] => {
  const q = query.trim().toLowerCase();
  if (!q) return recordings;
  return recordings.filter((r) => {
    const title = r.title.toLowerCase();
    const transcription = r.transcription.toLowerCase();
    return title.includes(q) || transcription.includes(q);
  });
};
