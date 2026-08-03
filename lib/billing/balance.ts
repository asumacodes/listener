import { createClient } from "@/lib/supabase/client";
import type { EffectiveBalance } from "@/types/billing";

/** Client preflight for KAN-54 — disables kickoff CTAs before posting /api/murmur/run. */
export const getEffectiveBalance =
  async (): Promise<EffectiveBalance | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_effective_balance");
    if (error || !data) return null;
    const row = data as EffectiveBalance;
    if (typeof row.can_kickoff !== "boolean") return null;
    return row;
  };
