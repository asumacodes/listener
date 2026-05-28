"use client";

import HighlightedSnippet from "@/components/HighlightedSnippet";
import BottomSheet from "@/components/ui/BottomSheet";
import useRecordingHistory from "@/hooks/useRecordingHistory";
import Link from "next/link";

type RecordingHistorySidebarProps = {
  open: boolean;
  onClose: () => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const RecordingHistorySidebar = ({
  open,
  onClose,
}: RecordingHistorySidebarProps) => {
  const { query, setQuery, items, loading, error } = useRecordingHistory(open);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-serif text-2xl text-text">Your recordings</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search transcriptions…"
        className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-gold"
      />

      <div className="mt-4 max-h-[55vh] overflow-y-auto">
        {loading && (
          <p className="py-6 text-center text-sm text-muted">Searching…</p>
        )}
        {error && <p className="py-6 text-center text-sm text-red">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="py-6 text-center text-sm text-text-secondary">
            {query.trim() ? "No matches." : "No recordings yet."}
          </p>
        )}

        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                href={`/projects/${r.project_id}#${r.id}`}
                onClick={onClose}
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
                {query.trim() && (
                  <div className="mt-1">
                    <HighlightedSnippet
                      transcription={r.transcription}
                      query={query}
                    />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  );
};

export default RecordingHistorySidebar;
