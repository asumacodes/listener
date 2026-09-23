"use client";

import { getSessionUser } from "@/lib/auth/session";
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

      // Nothing to compare against (no marker, other device, legacy marker,
      // failed pre-checkout read): we can't confirm, so say so neutrally.
      if (!userId || !pending?.baseline) {
        if (!providerFailed) setView(buildTimeoutView());
        return;
      }

      const tick = async () => {
        if (cancelled) return;
        const balance = await getBalanceForDisplay().catch(() => null);
        if (cancelled) return;

        if (balance && isGrantConfirmed(pending, balance)) {
          setView(buildConfirmedReturnView({ pending, balance }));
          emitBalanceChanged();
          // Plan markers stay for the studio's one-time welcome sheet; top-ups
          // have no studio beat, so this screen is their only confirmation.
          if (pending.action === "topup") clearCheckoutPending(userId);
          return;
        }

        // A vetoed return gets one read (so a real grant still wins), then rests.
        if (providerFailed) return;

        if (Date.now() - startedAt >= CHECKOUT_RETURN_TIMEOUT_MS) {
          setView(buildTimeoutView());
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
  }, [providerFailed]);

  return view;
};

export default useCheckoutReturn;
