/**
 * Coerce agent/Bridge JSON fields to display text.
 * Agents sometimes emit numbers or other non-strings for fields typed as string
 * (e.g. directOverlap: 80). `(value ?? "").trim()` crashes on those.
 */
export const agentText = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
};
