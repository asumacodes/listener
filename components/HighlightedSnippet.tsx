type HighlightedSnippetProps = {
  transcription: string | null;
  query: string;
  radius?: number;
};

const HighlightedSnippet = ({
  transcription,
  query,
  radius = 60,
}: HighlightedSnippetProps) => {
  if (!transcription) return null;

  const term = query.trim().split(/\s+/)[0] ?? "";
  if (!term) return null;

  const lower = transcription.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());

  if (idx === -1) {
    const preview =
      transcription.slice(0, radius * 2) +
      (transcription.length > radius * 2 ? "…" : "");
    return (
      <span className="text-xs leading-relaxed text-text-secondary">
        {preview}
      </span>
    );
  }

  const start = Math.max(0, idx - radius);
  const end = Math.min(transcription.length, idx + term.length + radius);

  const before = (start > 0 ? "…" : "") + transcription.slice(start, idx);
  const match = transcription.slice(idx, idx + term.length);
  const after =
    transcription.slice(idx + term.length, end) +
    (end < transcription.length ? "…" : "");

  return (
    <span className="text-xs leading-relaxed text-text-secondary">
      {before}
      <mark className="rounded bg-gold/20 px-0.5 text-text">{match}</mark>
      {after}
    </span>
  );
};

export default HighlightedSnippet;
