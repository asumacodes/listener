"use client";

import SearchHighlight from "@/components/search/SearchHighlight";
import { IconSearch } from "@/components/icons/ListenerIcons";
import useProjectColorMap from "@/hooks/useProjectColorMap";
import useRecordingHistory from "@/hooks/useRecordingHistory";
import { copy } from "@/lib/design/copy";
import {
  searchNoMatchesBody,
  searchResultsLabel,
} from "@/lib/design/search-copy";
import Input from "@/components/ui/Input";
import Link from "next/link";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const snippetAroundMatch = (text: string | null, query: string) => {
  if (!text) return "";
  const q = query.trim();
  if (!q) return text.slice(0, 120) + (text.length > 120 ? "…" : "");
  const lc = text.toLowerCase();
  const idx = lc.indexOf(q.toLowerCase());
  if (idx === -1) return text.slice(0, 120) + (text.length > 120 ? "…" : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 80);
  return (
    (start > 0 ? "…" : "") +
    text.slice(start, end) +
    (end < text.length ? "…" : "")
  );
};

const SearchView = () => {
  const { query, setQuery, items, loading, error } = useRecordingHistory();
  const colorMap = useProjectColorMap();
  const trimmed = query.trim();
  const isRecent = trimmed === "";
  const showEmpty = !loading && !error && items.length === 0;
  const showNoMatches = showEmpty && !isRecent;
  const showNoRecordings = showEmpty && isRecent;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-[18px] pb-2 pt-[52px]">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
            <IconSearch size={20} />
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search.placeholder}
            className="rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[18px] pb-6">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted">
            {copy.search.searching}
          </p>
        ) : null}

        {error ? (
          <p className="py-6 text-center text-sm text-red">{error}</p>
        ) : null}

        {showNoMatches ? (
          <div className="flex flex-col items-center px-6 pt-[60px] text-center">
            <div className="mb-[18px] flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-muted shadow-[0_0_0_6px_var(--gold-15)]">
              <IconSearch size={26} />
            </div>
            <h2 className="font-serif text-[26px] text-text">
              {copy.search.noMatches}
            </h2>
            <p className="mt-1 max-w-[32ch] text-sm leading-relaxed text-text-secondary">
              {searchNoMatchesBody(trimmed)}
            </p>
          </div>
        ) : null}

        {showNoRecordings ? (
          <p className="py-10 text-center text-sm text-text-secondary">
            {copy.search.noRecordings}
          </p>
        ) : null}

        {!loading && !error && items.length > 0 && isRecent ? (
          <>
            <p className="mb-0.5 mt-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {copy.search.recent}
            </p>
            <div className="flex flex-col">
              {items.map((r) => (
                <Link
                  key={r.id}
                  href={`/ideas/${r.id}`}
                  className="flex w-full items-center justify-between gap-3 border-b border-border bg-transparent py-3.5 text-left font-sans active:bg-canvas"
                >
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-text">
                    {r.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/[0.06]"
                      style={{
                        backgroundColor: colorMap[r.project_id] ?? "#C9A96E",
                      }}
                    />
                    {formatDate(r.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {!loading && !error && items.length > 0 && !isRecent ? (
          <>
            <p className="mb-0.5 mt-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {searchResultsLabel(items.length)}
            </p>
            <div className="flex flex-col gap-[11px]">
              {items.map((r) => (
                <Link
                  key={r.id}
                  href={`/ideas/${r.id}`}
                  className="relative flex w-full flex-col gap-1.5 rounded-2xl border border-border bg-surface py-4 pr-[30px] pl-4 text-left shadow-card active:scale-[0.995]"
                >
                  <div className="font-serif text-lg leading-[1.15] text-text">
                    <SearchHighlight text={r.title} query={trimmed} />
                  </div>
                  {r.transcription ? (
                    <div className="text-[13px] leading-normal text-text-secondary">
                      <SearchHighlight
                        text={snippetAroundMatch(r.transcription, trimmed)}
                        query={trimmed}
                      />
                    </div>
                  ) : null}
                  <span
                    className="absolute top-[18px] right-4 h-3 w-3 rounded-full border border-black/[0.06]"
                    style={{
                      backgroundColor: colorMap[r.project_id] ?? "#C9A96E",
                    }}
                  />
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SearchView;
