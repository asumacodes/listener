import { createClient } from "@/lib/supabase/client";

/**
 * How many of this user's pipeline runs are done.
 * Caps at 2 — callers only need 0, 1, or many (first-completion eligibility).
 */
export const countDoneRuns = async (): Promise<number> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pipeline_runs")
    .select("id")
    .eq("status", "done")
    .limit(2);
  if (error) return 0;
  return data?.length ?? 0;
};
