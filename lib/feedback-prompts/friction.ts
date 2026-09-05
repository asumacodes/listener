import { createClient } from "@/lib/supabase/client";

export type FrictionState = {
  delivered_ideas: number;
  eligible: boolean;
  has_row: boolean;
  dismissed: boolean;
  answered: boolean;
};

const INELIGIBLE: FrictionState = {
  delivered_ideas: 0,
  eligible: false,
  has_row: false,
  dismissed: false,
  answered: false,
};

export const getFrictionState = async (): Promise<FrictionState> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_friction_state");
  if (error || !data?.[0]) return INELIGIBLE;
  return data[0];
};

export const recordFrictionResponse = async ({
  runId,
  response,
  dismissed,
}: {
  runId?: string | null;
  response?: string | null;
  dismissed?: boolean;
}): Promise<string | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("record_friction_response", {
    p_run_id: runId ?? null,
    p_response: response ?? null,
    p_dismissed: dismissed ?? false,
  });
  if (error || !data) return null;
  return data;
};
