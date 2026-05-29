import { createClient } from "@/lib/supabase/client";

export type AccountStats = {
  recordings: number;
  projects: number;
};

export const fetchAccountStats = async (): Promise<AccountStats> => {
  const supabase = createClient();
  const [{ count: recordings }, { count: projects }] = await Promise.all([
    supabase.from("recordings").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  return {
    recordings: recordings ?? 0,
    projects: projects ?? 0,
  };
};
