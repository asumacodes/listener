"use client";

import { getSessionUser } from "@/lib/auth/session";
import { emitBalanceChanged } from "@/lib/billing/balanceSignal";
import {
  clearCheckoutPending,
  readCheckoutPending,
  type CheckoutPending,
} from "@/lib/billing/checkoutPending";
import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import {
  planWelcomeStamp,
  readPlanWelcomed,
  writePlanWelcomed,
} from "@/lib/billing/planWelcomed";
import {
  buildArrivingView,
  buildConfirmedView,
  type ArrivingView,
  type ConfirmedView,
} from "@/lib/billing/welcomeView";
import { useCallback, useEffect, useState } from "react";

/** Webhook usually lands inside a few seconds; the fast window covers that. */
const FAST_POLL_MS = 3_000;
const FAST_WINDOW_MS = 90_000;
const SLOW_POLL_MS = 15_000;

type UsePlanWelcome = {
  /** The numberless "arriving" card, or null. */
  arriving: ArrivingView | null;
  /** The one confirmed welcome, built entirely from the balance payload. */
  confirmed: ConfirmedView | null;
  dismissArriving: () => void;
  dismissConfirmed: () => void;
};

/**
 * Post-checkout welcome (KAN-85 Phase 3b).
 *
 * No `checkout.pending` in storage means this hook does nothing at all — no
 * poll, no card — so ordinary visits are untouched. With one, it polls the
 * balance until `current_tier` matches what was bought, then fires a single
 * welcome and deletes the pending marker. Nothing renders a count until the
 * payload carries one: the arriving beat is deliberately numberless, because
 * the founding doubling isn't knowable before the grant.
 */
export const usePlanWelcome = (): UsePlanWelcome => {
  const [pending, setPending] = useState<CheckoutPending | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedView | null>(null);
  const [slow, setSlow] = useState(false);
  const [arrivingHidden, setArrivingHidden] = useState(false);
  const [confirmedHidden, setConfirmedHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const startedAt = Date.now();

    void (async () => {
      const user = await getSessionUser().catch(() => null);
      const userId = user?.id ?? null;
      if (cancelled || !userId) return;

      const expected = readCheckoutPending(userId);
      if (!expected) return;

      const settle = (
        balance: NonNullable<Awaited<ReturnType<typeof getBalanceForDisplay>>>
      ) => {
        const stamp = planWelcomeStamp(
          balance.current_tier,
          balance.subscription_reset_at
        );
        clearCheckoutPending(userId);
        setPending(null);
        // Already welcomed for this tier and cycle — the grant is old news.
        if (readPlanWelcomed(userId) === stamp) return;
        writePlanWelcomed(userId, stamp);
        setConfirmed(buildConfirmedView({ balance, pending: expected }));
        emitBalanceChanged();
      };

      const tick = async () => {
        if (cancelled) return;
        const balance = await getBalanceForDisplay();
        if (cancelled) return;

        if (balance && balance.current_tier === expected.tier) {
          settle(balance);
          return;
        }

        // Still in flight — show the card only once a read has said so, so a
        // grant that beat us here never flashes the arriving copy.
        setPending(expected);
        const late = Date.now() - startedAt >= FAST_WINDOW_MS;
        if (late) setSlow(true);
        timer = window.setTimeout(
          () => void tick(),
          late ? SLOW_POLL_MS : FAST_POLL_MS
        );
      };

      await tick();
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const dismissArriving = useCallback(() => setArrivingHidden(true), []);
  const dismissConfirmed = useCallback(() => setConfirmedHidden(true), []);

  const arriving =
    pending && !confirmed && !arrivingHidden
      ? buildArrivingView({ tier: pending.tier, slow })
      : null;

  return {
    arriving,
    confirmed: confirmedHidden ? null : confirmed,
    dismissArriving,
    dismissConfirmed,
  };
};

export default usePlanWelcome;
