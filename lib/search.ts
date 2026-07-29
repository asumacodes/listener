import { createClient } from "@/lib/supabase/client";
import type { SearchResult } from "@/types/search";

export const searchRecordings = async (
  query: string,
  signal?: AbortSignal
): Promise<SearchResult[]> => {
  const q = query.trim();
  if (!q) return [];

  const supabase = createClient();
  let request = supabase.rpc("search_recordings", { q });
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error(`Search failed: ${error.message}`);
  return (data ?? []) as SearchResult[];
};
