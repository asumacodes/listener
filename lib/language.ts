const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  hi: "Hindi",
  ja: "Japanese",
  zh: "Chinese",
};

/** ISO 639-1 code for compact UI (e.g. "EN"). */
export const languageCode = (code: string | null): string | null => {
  if (!code?.trim()) return null;
  return code.trim().slice(0, 2).toUpperCase();
};

/** Friendly label, or uppercased code when unmapped. */
export const languageLabel = (code: string | null): string | null => {
  if (!code?.trim()) return null;
  const key = code.trim().toLowerCase().slice(0, 2);
  return LANGUAGE_LABELS[key] ?? key.toUpperCase();
};
