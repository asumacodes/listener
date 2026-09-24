"use client";

import { getSessionUser } from "@/lib/auth/session";
import { trackConfirmedGrant } from "@/lib/analytics/billing-events";
import { emitBalanceChanged } from "@/lib/billing/balanceSignal";
import {
  clearCheckoutPending,
  readCheckoutPending,
  type CheckoutPending,
} from "@/lib/billing/checkoutPending";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import { isGrantConfirmed } from "@/lib/billing/grantConfirmed";
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
import { useCallback, useEffect, useRef, useState } from "react";

/** Webhook usually lands inside a few seconds; the fast window covers that. */
const FAST_POLL_MS = 3_000;
const FAST_WINDOW_MS = 90_000;
const SLOW_POLL_MS = 15_000;
/** Past this, stop polling; the card rests in its neutral slow state. */
const POLL_CAP_MS = 10 * 60_000;

type PlanPending = CheckoutPending & { tier: PaidCheckoutTier };

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
 * No plan `checkout.pending` in storage means this hook does nothing at all —
 * no poll, no card — so ordinary visits are untouched. With one, it polls the
 * balance until it has moved past the pre-checkout baseline to the tier that
 * was bought (isGrantConfirmed), then fires a single welcome and deletes the
 * marker. Equality alone never confirms, and a baseline-less (legacy) marker
 * never can. The arriving beat is numberless and claims nothing about payment.
 */
export const usePlanWelcome = (): UsePlanWelcome => {
  const [pending, setPending] = useState<PlanPending | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedView | null>(null);
  const [slow, setSlow] = useState(false);
  const [arrivingHidden, setArrivingHidden] = useState(false);
  const [confirmedHidden, setConfirmedHidden] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const timerRef = useRef(0);
  const dismissedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    void (async () => {
      const user = await getSessionUser().catch(() => null);
      const userId = user?.id ?? null;
      if (cancelled || !userId) return;
      userIdRef.current = userId;

      const marker = readCheckoutPending(userId);
      if (!marker) return;
      // Top-ups are confirmed on the return screen; the studio has no beat.
      if (marker.action === "topup" || !marker.tier) return;
      // Legacy marker (pre-baseline): can never confirm — drop it, no welcome.
      if (!marker.baseline) {
        clearCheckoutPending(userId);
        return;
      }
      const expected: PlanPending = { ...marker, tier: marker.tier };

      const settle = (
        balance: NonNullable<Awaited<ReturnType<typeof getBalanceForDisplay>>>
      ) => {
        const stamp = planWelcomeStamp(
          balance.current_tier,
          balance.subscription_reset_at
        );
        // Confirmed grant (isGrantConfirmed passed) — deduped with the return
        // screen by the marker timestamp, so one checkout is one event.
        trackConfirmedGrant(userId, expected, balance);
        clearCheckoutPending(userId);
        setPending(null);
        // Already welcomed for this tier and cycle — the grant is old news.
        if (readPlanWelcomed(userId) === stamp) return;
        writePlanWelcomed(userId, stamp);
        setConfirmed(buildConfirmedView({ balance, pending: expected }));
        emitBalanceChanged();
      };

      const tick = async () => {
        if (cancelled || dismissedRef.current) return;
        const balance = await getBalanceForDisplay().catch(() => null);
        if (cancelled || dismissedRef.current) return;

        if (balance && isGrantConfirmed(expected, balance)) {
          settle(balance);
          return;
        }

        // Still in flight — show the card only once a read has said so, so a
        // grant that beat us here never flashes the arriving copy.
        setPending(expected);
        const elapsed = Date.now() - startedAt;
        const late = elapsed >= FAST_WINDOW_MS;
        if (late) setSlow(true);
        if (elapsed >= POLL_CAP_MS) return;
        timerRef.current = window.setTimeout(
          () => void tick(),
          late ? SLOW_POLL_MS : FAST_POLL_MS
        );
      };

      await tick();
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timerRef.current);
    };
  }, []);

  // Dismissing the slow card retires the expectation for good; if the grant
  // does land later, the balance itself shows it (just without the sheet).
  const dismissArriving = useCallback(() => {
    setArrivingHidden(true);
    dismissedRef.current = true;
    window.clearTimeout(timerRef.current);
    if (userIdRef.current) clearCheckoutPending(userIdRef.current);
  }, []);
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
