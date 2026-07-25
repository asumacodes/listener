/**
 * Normalize user-entered phone to E.164 (+ and digits only).
 * Returns null when the value is not a plausible E.164 number.
 */
export const normalizePhoneE164 = (raw: string): string | null => {
  const trimmed = raw.trim().replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) return null;
  return trimmed;
};
