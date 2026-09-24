/** Leading figure: ≥2000, 70%, ≥$10K, < 8 min — rest is detail. */
export const splitMetricFigure = (
  metric?: string,
  target?: string
): { figure: string; detail: string } => {
  const targetText = (target ?? "").trim();
  const metricText = (metric ?? "").trim();
  const source = targetText || metricText;
  if (!source) return { figure: "—", detail: "" };

  const match = source.match(
    /^([≤≥<>~≈]?\s*\$?\s*[\d,.]+(?:\s*[KkMmBb](?![a-z]))?(?:\/\s*[\d.]+)?%?(?:\s*(?:mins?|minutes?|hrs?|hours?|secs?|seconds?|days?|wks?|weeks?|mos?|months?|x|×)(?![a-z]))?)/i
  );

  if (match) {
    const figure = match[1].replace(/\s+/g, " ").trim();
    const rest = source
      .slice(match[0].length)
      .replace(/^[\s|—–\-:]+/, "")
      .trim();
    const detail =
      rest ||
      (source === targetText && metricText && metricText !== figure
        ? metricText
        : "");
    return { figure, detail };
  }

  // Fields sometimes swapped: short target-like metric, long description in metric field.
  if (targetText && metricText) {
    const swapped = metricText.match(
      /^([≤≥<>~≈]?\s*\$?\s*[\d,.]+(?:\s*[KkMmBb](?![a-z]))?%?)/i
    );
    if (swapped && metricText.length <= 24) {
      return {
        figure: swapped[1].replace(/\s+/g, " ").trim(),
        detail: targetText,
      };
    }
  }

  return {
    figure: source,
    detail: metricText && metricText !== source ? metricText : "",
  };
};

export const isCompactFigure = (figure: string): boolean =>
  figure.length > 0 &&
  figure.length <= 14 &&
  /\d/.test(figure) &&
  /^[≤≥<>~≈$%\d\s.,/KkMmBbhrminsecdaywksox×-]+$/i.test(figure);
