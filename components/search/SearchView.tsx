"use client";

import IdeaCard from "@/components/cards/IdeaCard";
import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import { IconSearch } from "@/components/icons/ListenerIcons";
import HighlightedSnippet from "@/components/HighlightedSnippet";
import useRecordingHistory from "@/hooks/useRecordingHistory";
import Input from "@/components/ui/Input";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const SearchView = () => {
  const { query, setQuery, items, loading, error } = useRecordingHistory();
  const trimmed = query.trim();

  return (
    <>
      <AppShellHeader title="Search" />

      <ScrollBody>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
            <IconSearch size={18} />
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recordings…"
            className="pl-11"
          />
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted">Searching…</p>
          ) : null}
          {error ? (
            <p className="py-6 text-center text-sm text-red">{error}</p>
          ) : null}

          {!loading && !error && items.length === 0 ? (
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
                <p className="text-sm text-text-secondary">
                  No recordings yet.
                </p>
              )}
            </div>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <>
              <p className="type-eyebrow mb-3">
                {trimmed
                  ? `${items.length} match${items.length === 1 ? "" : "es"}`
                  : "Recent"}
              </p>
              <ul className="space-y-3">
                {items.map((r) => (
                  <li key={r.id}>
                    <IdeaCard
                      href={`/ideas/${r.id}`}
                      title={r.title}
                      summary={
                        trimmed ? (
                          <HighlightedSnippet
                            transcription={r.transcription}
                            query={query}
                          />
                        ) : (
                          r.transcription
                        )
                      }
                      time={formatDate(r.created_at)}
                      status="mapping"
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </ScrollBody>
    </>
  );
};

export default SearchView;
