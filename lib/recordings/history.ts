import { createClient } from "@/lib/supabase/client";
import type { SearchResult } from "@/types/search";

const RECENT_SELECT =
  "id, title, transcription, language, duration_seconds, project_id, created_at";

export const listRecentRecordings = async (
  signal?: AbortSignal
): Promise<SearchResult[]> => {
  const supabase = createClient();
  let query = supabase
    .from("recordings")
    .select(RECENT_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;

  if (error) throw new Error(`Failed to load recordings: ${error.message}`);

  return (data ?? []).map((row) => ({ ...row, rank: 0 })) as SearchResult[];
};
