"use client";

import { getSessionUser } from "@/lib/auth/session";
import { subscribeBalanceChanged } from "@/lib/billing/balanceSignal";
import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import { toPipelineRunRow } from "@/lib/murmur/run-rows";
import { createClient } from "@/lib/supabase/client";
import type { BalanceDisplay } from "@/types/billing";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

/**
 * Shared display-balance read. Every call site observes this key, so the pill,
 * Plan, Settings, Account, checkout, and the quota nudge share one in-flight
 * RPC and one cached `BalanceDisplay`.
 *
 * A done-status pipeline run and `listener:balance-changed` invalidate this
 * key from EntitlementBalanceSync — one Realtime channel, not one per caller.
 * Fail closed: a thrown or empty read is `null`, never a throw to the caller.
 */
export const entitlementBalanceQueryKey = ["entitlement-balance"] as const;

export function useEntitlementBalance({
  enabled = true,
}: { enabled?: boolean } = {}): {
  balance: BalanceDisplay | null;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const query = useQuery({
    queryKey: entitlementBalanceQueryKey,
    enabled,
    // Handled failure is a successful null. Do not throw, or the client
    // default retry would run the RPC again.
    retry: false,
    queryFn: async (): Promise<BalanceDisplay | null> => {
      try {
        return await getBalanceForDisplay();
      } catch {
        return null;
      }
    },
  });

  const { refetch: refetchQuery } = query;
  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  return {
    balance: query.data ?? null,
    // isLoading is isPending && isFetching. A disabled observer is idle, so
    // enabled:false is not loading — even when this mount has never fetched.
    loading: query.isLoading,
    refetch,
  };
}

/**
 * One account-wide pipeline_runs subscription for the shared balance query.
 * Call only from EntitlementBalanceSync, which is mounted once under
 * QueryProvider. A `failed` run does not debit, so it does not invalidate.
 *
 * Login is a client navigation, so the session is resolved on mount and again
 * on auth changes. No user means no channel.
 */
export const useEntitlementBalanceSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeBalanceChanged(() => {
      void queryClient.invalidateQueries({
        queryKey: entitlementBalanceQueryKey,
      });
    });
  }, [queryClient]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let subscribedUserId: string | null = null;
    const pending = new Set<ReturnType<typeof setTimeout>>();

    const invalidate = () => {
      void queryClient.invalidateQueries({
        queryKey: entitlementBalanceQueryKey,
      });
    };

    const syncChannel = (userId: string | null) => {
      if (cancelled || userId === subscribedUserId) return;
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
      subscribedUserId = userId;
      if (!userId) return;

      channel = supabase
        .channel(`murmur-entitlements-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "pipeline_runs",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const run = toPipelineRunRow(payload.new);
            if (run?.status === "done") invalidate();
          }
        )
        .subscribe();
    };

    void getSessionUser().then((user) => {
      syncChannel(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      // Defer: supabase-js deadlocks if the client is used inside this callback.
      const timer = setTimeout(() => {
        pending.delete(timer);
        syncChannel(userId);
      }, 0);
      pending.add(timer);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      for (const timer of pending) clearTimeout(timer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
