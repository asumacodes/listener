"use client";

import { fetchFoundingCounter } from "@/lib/billing/foundingClient";
import {
  buildFoundingView,
  type FoundingView,
} from "@/lib/billing/foundingView";
import { useQuery } from "@tanstack/react-query";

export const foundingCounterKey = ["founding-counter"] as const;

/**
 * Cached founding-counter read → callout view. One shared query (react-query
 * dedupes across the picker, sheet and checkout), fresh for a minute — not an
 * RPC per render. Loading or failed → `static` (no number), never a guess.
 */
const useFoundingCounter = (): FoundingView => {
  const query = useQuery({
    queryKey: foundingCounterKey,
    queryFn: ({ signal }) => fetchFoundingCounter(signal),
    staleTime: 60_000,
    retry: 1,
  });
  return buildFoundingView(query.isSuccess ? query.data : null);
};

export default useFoundingCounter;
