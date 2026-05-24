export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatDurationSeconds = (seconds: number): string => {
  return `${seconds} SEC`;
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
