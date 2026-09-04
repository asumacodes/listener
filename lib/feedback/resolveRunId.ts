import { findActiveRun } from "@/lib/murmur/runs";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Idea pages use the view rule only (never occupancy). Off idea pages:
 * occupying run else null. A client-sent run_id is not a parameter here.
 */
export const resolveRunId = async (
  supabase: ServerSupabase,
  userId: string,
  pathname: string,
  selectedRun: string | null
): Promise<string | null> => {
  if (pathname.startsWith("/d/")) return null;

  const ideaMatch = pathname.match(/^\/ideas\/([^/?#]+)/);
  if (ideaMatch) {
    const recordingId = ideaMatch[1];
    const { data: runs, error } = await supabase
      .from("pipeline_runs")
      .select("id, created_at")
      .eq("recording_id", recordingId)
      .order("created_at", { ascending: false });

    if (error || !runs || runs.length === 0) return null;
    if (selectedRun && runs.some((r) => r.id === selectedRun)) {
      return selectedRun;
    }
    return runs[0].id;
  }

  const active = await findActiveRun(supabase, userId);
  return active?.id ?? null;
};
