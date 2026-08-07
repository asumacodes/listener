/** WebM blobs from MediaRecorder often report `Infinity` until decoded — never pass through to UI. */
export const sanitizeSeconds = (seconds: number, fallback = 0): number => {
  if (!Number.isFinite(seconds) || seconds < 0) return fallback;
  return Math.floor(seconds);
};

export const formatTime = (seconds: number): string => {
  const safe = sanitizeSeconds(seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatDurationSeconds = (seconds: number): string => {
  return `${seconds} secs`;
};

export const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export const formatTranscriptionDate = (date: Date = new Date()): string => {
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  return `${month} ${day}, ${time}`;
};

export const formatLanguageTag = (language: string | null): string => {
  if (!language) return "EN";
  return language.slice(0, 2).toUpperCase();
};

export const formatIsoDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

/** "1 idea" / "4 ideas" — coerces count for Supabase aggregates. */
export const formatIdeasCount = (count: number): string => {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return "0 ideas";
  return `${n} idea${n === 1 ? "" : "s"}`;
};
