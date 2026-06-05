const SESSION_KEY = "listener:recording-session";

export type RecordingSession = {
  savedRecordingId: string;
};

export const readRecordingSession = (): RecordingSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as RecordingSession).savedRecordingId === "string"
    ) {
      return {
        savedRecordingId: (parsed as RecordingSession).savedRecordingId,
      };
    }
  } catch {
    // ignore corrupt session
  }
  return null;
};

export const writeRecordingSession = (session: RecordingSession): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearRecordingSession = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
};
