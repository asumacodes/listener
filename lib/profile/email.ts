/** Lightweight profile-email helpers — format check + write-side normalise. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return EMAIL_RE.test(trimmed);
};

/** Trim + lowercase. Empty / non-string → null (caller must omit the patch key). */
export const normaliseProfileEmail = (
  value: string | null | undefined
): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
};
