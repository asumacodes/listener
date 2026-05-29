"use client";

import HighlightedSnippet from "@/components/HighlightedSnippet";
import Wordmark from "@/components/Wordmark";
import useRecordingHistory from "@/hooks/useRecordingHistory";
import Link from "next/link";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const SearchView = () => {
  const { query, setQuery, items, loading, error } = useRecordingHistory();
  const trimmed = query.trim();
  const showRecent = !trimmed && items.length > 0;

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 pt-4">
      <Wordmark />

      <div className="relative mt-4">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recordings…"
          className="w-full rounded-xl border border-border bg-surface py-3 pr-10 pl-11 text-sm text-text outline-none focus:border-gold"
        />
        {trimmed && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition hover:text-text"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-5">
        {loading && (
          <p className="py-6 text-center text-sm text-muted">Searching…</p>
        )}
        {error && <p className="py-6 text-center text-sm text-red">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="py-16 text-center">
            {trimmed ? (
              <>
                <p className="font-serif text-xl text-text">No matches</p>
                <p className="mt-2 text-sm text-text-secondary">
                  We couldn&apos;t find &ldquo;{trimmed}&rdquo;. Check the
                  spelling or try another word.
                </p>
              </>
            ) : (
              <p className="text-sm text-text-secondary">No recordings yet.</p>
            )}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <p className="mb-3 text-[10px] tracking-[0.12em] text-muted uppercase">
              {trimmed
                ? `${items.length} match${items.length === 1 ? "" : "es"}`
                : "Recent"}
            </p>
            <ul className="space-y-3">
              {items.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/projects/${r.project_id}#${r.id}`}
                    className="block rounded-xl border border-border bg-surface p-4 transition hover:border-gold/50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-base text-text">
                        {r.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    {trimmed && (
                      <div className="mt-1">
                        <HighlightedSnippet
                          transcription={r.transcription}
                          query={query}
                        />
                      </div>
                    )}
                    {showRecent && r.transcription && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                        {r.transcription}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
};

export default SearchView;
