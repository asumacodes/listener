/**
 * Leading figure: ≥2000, 70%, ≥$10K, < 8 min. `label` is the metric's name
 * when the figure came from the target; `detail` is only what trails the figure.
 */
export const splitMetricFigure = (
  metric?: string,
  target?: string
): { label: string; figure: string; detail: string } => {
  const targetText = (target ?? "").trim();
  const metricText = (metric ?? "").trim();
  const source = targetText || metricText;
  if (!source) return { label: "", figure: "—", detail: "" };
  const label =
    source === targetText && metricText !== targetText ? metricText : "";

  const match = source.match(
    /^([≤≥<>~≈]?\s*\$?\s*[\d,.]+(?:\s*[KkMmBb](?![a-z]))?(?:\/\s*[\d.]+)?%?(?:\s*(?:mins?|minutes?|hrs?|hours?|secs?|seconds?|days?|wks?|weeks?|mos?|months?|x|×)(?![a-z]))?)/i
  );

  if (match) {
    const figure = match[1].replace(/\s+/g, " ").trim();
    const rest = source
      .slice(match[0].length)
      .replace(/^[\s|—–\-:]+/, "")
      .trim();
    return { label: label === figure ? "" : label, figure, detail: rest };
  }

  // Fields sometimes swapped: short target-like metric, long description in metric field.
  if (targetText && metricText) {
    const swapped = metricText.match(
      /^([≤≥<>~≈]?\s*\$?\s*[\d,.]+(?:\s*[KkMmBb](?![a-z]))?%?)/i
    );
    if (swapped && metricText.length <= 24) {
      return {
        label: "",
        figure: swapped[1].replace(/\s+/g, " ").trim(),
        detail: targetText,
      };
    }
  }

  return { label, figure: source, detail: "" };
};

export const isCompactFigure = (figure: string): boolean =>
  figure.length > 0 &&
  figure.length <= 14 &&
  /\d/.test(figure) &&
  /^[≤≥<>~≈$%\d\s.,/KkMmBbhrminsecdaywksox×-]+$/i.test(figure);
