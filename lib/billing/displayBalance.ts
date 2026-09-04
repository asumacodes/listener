import { createClient } from "@/lib/supabase/client";
import { parseBalances } from "@/lib/billing/parseBalances";
import type { BalanceDisplay } from "@/types/billing";

/**
 * KAN-82 display reader. Full validated balance + derived effective remaining.
 * Distinct from lib/billing/balance.ts (the can_kickoff preflight for
 * DesktopIdeaView — left untouched). Routes through the lifted strict parser.
 *
 * Returns null for explicit-empty AND malformed — the pill collapses both to
 * "no pill". A valid balance of 0 is NOT null and renders "0 ideas left".
 */
export const getBalanceForDisplay =
  async (): Promise<BalanceDisplay | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_effective_balance");
    if (error) return null;
    const parsed = parseBalances(data);
    if (!parsed) return null; // collapses null | undefined
    const effectiveRemaining =
      parsed.free_grant_remaining +
      parsed.subscription_grant_remaining +
      parsed.purchased_balance;
    return { ...parsed, effectiveRemaining };
  };
