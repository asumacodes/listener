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

/**
 * Coerce `directOverlap` which may be a dimension list, prose/tier string, or score.
 * Arrays are preserved; scalars become trimmed text (empty string if unusable).
 */
export const agentOverlapValue = (value: unknown): string | string[] => {
  if (Array.isArray(value)) {
    return value.map(agentText).filter(Boolean);
  }
  return agentText(value);
};

/** Flat text for notes/cards — joins dimension lists with "; ". */
export const agentOverlapText = (value: unknown): string => {
  const overlap = agentOverlapValue(value);
  return Array.isArray(overlap) ? overlap.join("; ") : overlap;
};
