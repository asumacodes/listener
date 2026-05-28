import { createClient } from "@/lib/supabase/client";
import type { SearchResult } from "@/types/search";

const RECENT_SELECT =
  "id, title, transcription, language, duration_seconds, project_id, created_at";

export const listRecentRecordings = async (): Promise<SearchResult[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recordings")
    .select(RECENT_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to load recordings: ${error.message}`);

  return (data ?? []).map((row) => ({ ...row, rank: 0 })) as SearchResult[];
};
