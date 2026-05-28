import { createClient } from "@/lib/supabase/client";
import type { SearchResult } from "@/types/search";

export const searchRecordings = async (
  query: string
): Promise<SearchResult[]> => {
  const q = query.trim();
  if (!q) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_recordings", { q });
  if (error) throw new Error(`Search failed: ${error.message}`);
  return (data ?? []) as SearchResult[];
};
