import { createClient } from "@/lib/supabase/client";

/** Cheap empty-studio signal for mobile idle — not the desktop home aggregator. */
export const hasAnyRecording = async (): Promise<boolean> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recordings")
    .select("id")
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
};
