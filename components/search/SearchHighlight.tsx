import type { ReactNode } from "react";

type SearchHighlightProps = {
  text: string;
  query: string;
  className?: string;
};

/** Mockup `highlight()` — gold-tinted marks on every case-insensitive match. */
const SearchHighlight = ({
  text,
  query,
  className = "",
}: SearchHighlightProps) => {
  const q = query.trim();
  if (!q) return <span className={className}>{text}</span>;

  const parts: ReactNode[] = [];
  const lc = text.toLowerCase();
  const lq = q.toLowerCase();
  let i = 0;
  let idx = lc.indexOf(lq);
  let key = 0;

  while (idx !== -1) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark
        key={key++}
        className="rounded-sm bg-[rgba(201,169,110,0.32)] px-px text-inherit"
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    i = idx + q.length;
    idx = lc.indexOf(lq, i);
  }
  parts.push(text.slice(i));

  return <span className={className}>{parts}</span>;
};

export default SearchHighlight;
