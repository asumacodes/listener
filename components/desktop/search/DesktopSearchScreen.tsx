"use client";

import SearchHighlight from "@/components/search/SearchHighlight";
import { IconSearch } from "@/components/icons/ListenerIcons";
import Input from "@/components/ui/Input";
import SkeletonSearchResults from "@/components/ui/skeleton/SkeletonSearchResults";
import useProjectColorMap from "@/hooks/useProjectColorMap";
import useRecordingHistory from "@/hooks/useRecordingHistory";
import {
  searchNoMatchesHint,
  searchNoMatchesLead,
  searchResultsLabel,
} from "@/lib/design/search-copy";
import { ui } from "@/lib/design/ui";
import { formatShortDate } from "@/lib/format-date";
import Link from "next/link";
import { useEffect } from "react";

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

/**
 * Desktop search — recent list + result cards with gold highlight.
 * Uses shared `useRecordingHistory` (transcripts + titles).
 */
const DesktopSearchScreen = () => {
  const { query, setQuery, items, loading, error } = useRecordingHistory();
  const colorMap = useProjectColorMap();
  const trimmed = query.trim();
  const isRecent = trimmed === "";
  const showEmpty = !loading && !error && items.length === 0;
  const showNoMatches = showEmpty && !isRecent;
  const showNoRecordings = showEmpty && isRecent;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || isRecent || items.length === 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        window.location.href = `/ideas/${items[0].id}`;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRecent, items]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas">
      <div className="mx-auto flex w-full max-w-[708px] flex-1 flex-col px-8 py-8">
        <h1 className="font-serif text-[27px] leading-none text-text">
          Search
        </h1>

        <div className="relative mt-5">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
            <IconSearch size={18} />
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, transcripts, and artifacts"
            className="h-12 rounded-xl py-0 pl-11 pr-20 text-sm"
            autoFocus
          />
          {trimmed ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted hover:text-text"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-7 flex min-h-0 flex-1 flex-col pb-6">
          {loading ? <SkeletonSearchResults /> : null}

          {error ? (
            <p className="py-6 text-center text-sm text-red">{error}</p>
          ) : null}

          {showNoMatches ? (
            <div className="py-12 text-center">
              <IconSearch size={28} className="mx-auto mb-4 text-muted" />
              <h2 className="font-serif text-[26px] text-text">No matches</h2>
              <p className="mt-2 text-sm text-text-secondary">
                {searchNoMatchesLead(trimmed)}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {searchNoMatchesHint}
              </p>
            </div>
          ) : null}

          {showNoRecordings ? (
            <p className="py-12 text-center text-sm text-text-secondary">
              No recordings yet.
            </p>
          ) : null}

          {!loading && !error && items.length > 0 && isRecent ? (
            <>
              <p className={ui.eyebrow}>Recent</p>
              <ul className="mt-3">
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/ideas/${r.id}`}
                      className="flex h-[60px] items-center justify-between gap-4 border-b border-border transition hover:bg-black/[0.02]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/[0.06]"
                          style={{
                            backgroundColor:
                              colorMap[r.project_id] ?? "#C9A96E",
                          }}
                        />
                        <span className="truncate font-serif text-[19px] text-text">
                          {r.title}
                        </span>
                      </span>
                      <span className={`${ui.eyebrow} shrink-0`}>
                        {formatShortDate(r.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-8 text-xs text-muted">
                Search covers transcripts and artifact bodies, not just titles.
              </p>
            </>
          ) : null}

          {!loading && !error && items.length > 0 && !isRecent ? (
            <>
              <p className={ui.eyebrow}>{searchResultsLabel(items.length)}</p>
              <ul className="mt-3 space-y-3">
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/ideas/${r.id}`}
                      className="block rounded-2xl border border-border bg-surface px-5 py-5 transition hover:border-gold/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-serif text-[21px] leading-tight text-text">
                          <SearchHighlight text={r.title} query={trimmed} />
                        </h2>
                        <div className="flex shrink-0 items-center gap-2.5">
                          <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted uppercase">
                            Transcript
                          </span>
                          <span className={`${ui.eyebrow}`}>
                            {formatShortDate(r.created_at)}
                          </span>
                        </div>
                      </div>
                      {r.transcription ? (
                        <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                          <SearchHighlight
                            text={snippetAroundMatch(r.transcription, trimmed)}
                            query={trimmed}
                          />
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-8 text-xs text-muted">
                Press ↵ to open the first result.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DesktopSearchScreen;
