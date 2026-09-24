"use client";

import { getSessionUser } from "@/lib/auth/session";
import {
  intentForPending,
  trackCheckoutAbandoned,
  trackCheckoutFailed,
  trackConfirmedGrant,
  type CheckoutIntentProp,
} from "@/lib/analytics/billing-events";
import { hasFired, markFired } from "@/lib/analytics/run-fired-guard";
import { emitBalanceChanged } from "@/lib/billing/balanceSignal";
import {
  clearCheckoutPending,
  readCheckoutPending,
} from "@/lib/billing/checkoutPending";
import type { CheckoutReturnAction } from "@/lib/billing/checkoutReturn";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import { isGrantConfirmed } from "@/lib/billing/grantConfirmed";
import {
  buildConfirmedReturnView,
  buildConfirmingView,
  buildFailedView,
  buildTimeoutView,
  type ReturnView,
} from "@/lib/billing/returnView";
import { useEffect, useState } from "react";

const POLL_MS = 2_000;
/** Webhooks usually land in seconds; past this we stop and say so honestly. */
export const CHECKOUT_RETURN_TIMEOUT_MS = 90_000;

/**
 * /checkout/return state machine. Starts at `confirming` (or `failed` when
 * Dodo's status vetoes), and reaches `confirmed` only when a balance read has
 * moved past the pre-checkout baseline. Never confirms from the URL, the
 * redirect, or the marker alone; unconfirmable or slow → `timeout`.
 */
export const useCheckoutReturn = ({
  action,
  tier,
  providerFailed,
}: {
  /** Copy hint only. */
  action: CheckoutReturnAction;
  tier: PaidCheckoutTier | null;
  /** Dodo's `status` said failed/cancelled — a veto, never a success signal. */
  providerFailed: boolean;
}): ReturnView => {
  const [view, setView] = useState<ReturnView>(() =>
    providerFailed ? buildFailedView() : buildConfirmingView({ action, tier })
  );

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const startedAt = Date.now();

    void (async () => {
      const user = await getSessionUser().catch(() => null);
      if (cancelled) return;
      const userId = user?.id ?? null;
      const pending = userId ? readCheckoutPending(userId) : null;

      // Terminal-outcome analytics, once per return (a reload doesn't re-count).
      const intent: CheckoutIntentProp = pending
        ? intentForPending(pending)
        : action;
      const outcomeKey = pending ? `ts${pending.ts}` : window.location.search;
      const settleOutcome = (outcome: "failed" | "abandoned") => {
        if (hasFired(`checkout_${outcome}`, outcomeKey)) return;
        markFired(`checkout_${outcome}`, outcomeKey);
        if (outcome === "failed") trackCheckoutFailed(intent);
        else trackCheckoutAbandoned(intent);
      };

      // Nothing to compare against (no marker, other device, legacy marker,
      // failed pre-checkout read): we can't confirm, so say so neutrally.
      if (!userId || !pending?.baseline) {
        if (providerFailed) {
          // Dodo itself reported the failure on this redirect — that's real.
          settleOutcome("failed");
        } else {
          // "Can't tell" (e.g. paid on another device), NOT abandoned — firing
          // checkout_abandoned here would count cross-device completions.
          setView(buildTimeoutView());
        }
        return;
      }

      const tick = async () => {
        if (cancelled) return;
        const balance = await getBalanceForDisplay().catch(() => null);
        if (cancelled) return;

        if (balance && isGrantConfirmed(pending, balance)) {
          setView(buildConfirmedReturnView({ pending, balance }));
          // The ONLY place (with the studio welcome) checkout_completed and
          // founding_slot_claimed fire: a confirmed grant, deduped per checkout.
          trackConfirmedGrant(userId, pending, balance);
          emitBalanceChanged();
          // Plan markers stay for the studio's one-time welcome sheet; top-ups
          // have no studio beat, so this screen is their only confirmation.
          if (pending.action === "topup") clearCheckoutPending(userId);
          return;
        }

        // A vetoed return gets one read (so a real grant still wins), then rests.
        if (providerFailed) {
          settleOutcome("failed");
          return;
        }

        if (Date.now() - startedAt >= CHECKOUT_RETURN_TIMEOUT_MS) {
          setView(buildTimeoutView());
          settleOutcome("abandoned");
          return;
        }
        timer = window.setTimeout(() => void tick(), POLL_MS);
      };

      await tick();
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [action, providerFailed]);

  return view;
};

export default useCheckoutReturn;
