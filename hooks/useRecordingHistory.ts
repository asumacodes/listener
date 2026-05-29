"use client";

import { listRecentRecordings } from "@/lib/recordings/history";
import { searchRecordings } from "@/lib/search";
import type { SearchResult } from "@/types/search";
import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 250;

export const useRecordingHistory = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listRecentRecordings());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    const delay = trimmed === "" ? 0 : DEBOUNCE_MS;

    debounceRef.current = setTimeout(() => {
      if (trimmed === "") {
        void loadRecent();
        return;
      }

      void (async () => {
        setLoading(true);
        setError(null);
        try {
          setItems(await searchRecordings(query));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Search failed");
        } finally {
          setLoading(false);
        }
      })();
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, loadRecent]);

  return { query, setQuery, items, loading, error, reload: loadRecent };
};

export default useRecordingHistory;
