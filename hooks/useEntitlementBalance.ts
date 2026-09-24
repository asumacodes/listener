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
 * Plan, Settings, Account, checkout, the quota nudge and the home banners share
 * one in-flight RPC and one cached `BalanceDisplay`.
 *
 * The key is scoped to the signed-in user and only enabled once that user is
 * known: get_effective_balance answers a session-less call with `null` (200),
 * so a read racing the session must never be cached as "this user's balance",
 * nor one account's balance shown under another.
 *
 * An empty or failed read is an ERROR (retried twice, quickly), not a cached
 * successful `null` — errors aren't fresh, so the next mount refetches instead
 * of pinning "unavailable" for the stale window. Callers still get
 * `balance: null` once retries are exhausted (fail closed, never a throw).
 *
 * A done-status pipeline run and `listener:balance-changed` invalidate every
 * user's entry (prefix match) from EntitlementBalanceSync.
 */
export const entitlementBalanceQueryKey = ["entitlement-balance"] as const;

/** The signed-in user's id, shared; kept current by EntitlementBalanceSync. */
export const sessionUserIdQueryKey = ["session-user-id"] as const;

const BALANCE_RETRIES = 2;

class BalanceUnavailableError extends Error {
  constructor() {
    super("balance_unavailable");
    this.name = "BalanceUnavailableError";
  }
}

const useSessionUserId = () =>
  useQuery({
    queryKey: sessionUserIdQueryKey,
    queryFn: async (): Promise<string | null> => {
      const user = await getSessionUser().catch(() => null);
      return user?.id ?? null;
    },
    // Auth changes push the new id in (EntitlementBalanceSync); no polling.
    staleTime: Infinity,
    retry: false,
  });

export function useEntitlementBalance({
  enabled = true,
}: { enabled?: boolean } = {}): {
  balance: BalanceDisplay | null;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const session = useSessionUserId();
  const userId = session.data ?? null;

  const query = useQuery({
    queryKey: [...entitlementBalanceQueryKey, userId],
    enabled: enabled && userId !== null,
    retry: BALANCE_RETRIES,
    retryDelay: (attempt) => 400 * (attempt + 1),
    queryFn: async (): Promise<BalanceDisplay> => {
      const balance = await getBalanceForDisplay().catch(() => null);
      if (!balance) throw new BalanceUnavailableError();
      return balance;
    },
  });

  const { refetch: refetchQuery } = query;
  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  return {
    balance: query.data ?? null,
    // Waiting for the session id counts as loading (not "unavailable").
    // isLoading is isPending && isFetching; retries keep it true, so screens
    // hold their skeleton until the last attempt. enabled:false is idle.
    loading:
      enabled && (session.isLoading || (userId !== null && query.isLoading)),
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
        // Keep the balance key on the right user: sign-in / sign-out / switch.
        const previous = queryClient.getQueryData<string | null>(
          sessionUserIdQueryKey
        );
        if (previous !== userId) {
          queryClient.setQueryData(sessionUserIdQueryKey, userId);
          if (!userId) {
            queryClient.removeQueries({ queryKey: entitlementBalanceQueryKey });
          }
        }
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
