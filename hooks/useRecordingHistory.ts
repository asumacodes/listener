"use client";

import { listRecentRecordings } from "@/lib/recordings/history";
import { searchRecordings } from "@/lib/search";
import type { SearchResult } from "@/types/search";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const DEBOUNCE_MS = 250;
const recentRecordingsKey = ["recordings", "recent"] as const;
const searchRecordingsKey = (query: string) =>
  ["recordings", "search", query] as const;

export const useRecordingHistory = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    const delay = trimmed === "" ? 0 : DEBOUNCE_MS;
    const timeout = setTimeout(() => setDebouncedQuery(trimmed), delay);
    return () => clearTimeout(timeout);
  }, [query]);

  const isRecent = debouncedQuery === "";
  const historyQuery = useQuery<SearchResult[], Error>({
    queryKey: isRecent
      ? recentRecordingsKey
      : searchRecordingsKey(debouncedQuery),
    queryFn: ({ signal }) =>
      isRecent
        ? listRecentRecordings(signal)
        : searchRecordings(debouncedQuery, signal),
  });

  return {
    query,
    setQuery,
    items: historyQuery.data ?? [],
    loading: historyQuery.isPending,
    error: historyQuery.error?.message ?? null,
    reload: historyQuery.refetch,
  };
};

export default useRecordingHistory;
