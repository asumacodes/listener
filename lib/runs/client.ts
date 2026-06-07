import { createClient } from "@/lib/supabase/client";

export const deleteRun = async (runId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("pipeline_runs")
    .delete()
    .eq("id", runId);
  if (error) throw new Error(`Failed to delete run: ${error.message}`);
};
