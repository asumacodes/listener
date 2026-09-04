"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSessionUser } from "@/lib/auth/session";
import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import { toPipelineRunRow } from "@/lib/murmur/run-rows";
import type { BalanceDisplay } from "@/types/billing";

/**
 * KAN-82. Reads the display balance and refetches when one of the user's own
 * pipeline_runs reaches status 'done' — the debit happens at Bridge delivery
 * (consume_entitlement_for_run, done-only), not at kickoff, so a fire-once read
 * goes stale after a run completes. 'failed' does not decrement → not a trigger.
 *
 * Own account-wide channel (murmur-entitlements-${userId}); deliberately NOT
 * subscribeToLiveRun, which is scoped to one run id and misses other recordings.
 * RPC authorizes via auth.uid(); the user id is used only for the Realtime filter.
 */
export function useEntitlementBalance() {
  const [balance, setBalance] = useState<BalanceDisplay | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const next = await getBalanceForDisplay();
    setBalance(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getBalanceForDisplay().then((next) => {
      if (cancelled) return;
      setBalance(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const user = await getSessionUser();
      if (cancelled || !user?.id) return;
      channel = supabase
        .channel(`murmur-entitlements-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "pipeline_runs",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const run = toPipelineRunRow(payload.new);
            if (run?.status === "done") void refetch();
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { balance, loading };
}
