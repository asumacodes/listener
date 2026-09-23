"use client";

import { useCheckoutActions } from "@/hooks/useCheckoutActions";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import type {
  PaidCheckoutTier,
  ReviewAction,
} from "@/lib/billing/checkoutTier";
import { resolvePaidCheckoutAction } from "@/lib/billing/checkoutCta";
import { buildReviewView, type ReviewView } from "@/lib/billing/reviewView";
import useDisplayCurrency from "@/hooks/useDisplayCurrency";
import { useCallback, useMemo } from "react";

type UseCheckoutReview = {
  view: ReviewView;
  loading: boolean;
  busy: boolean;
  error: string | null;
  clearError: () => void;
  /** True when the account already sits at or above this tier. */
  blocked: boolean;
  confirm: () => void;
};

/**
 * Pre-checkout review. The URL carries the intended action, but the balance
 * still decides: a stale link that would downgrade is blocked here rather than
 * failing at Dodo.
 */
export const useCheckoutReview = ({
  tier,
  action,
}: {
  tier: PaidCheckoutTier;
  action: ReviewAction;
}): UseCheckoutReview => {
  const { balance, loading } = useEntitlementBalance();
  const currency = useDisplayCurrency();
  const { busy, error, clearError, startCheckout, startUpgrade } =
    useCheckoutActions();

  const resolved = balance
    ? resolvePaidCheckoutAction(tier, balance.current_tier)
    : action;

  const view = useMemo(
    () =>
      buildReviewView({
        tier,
        action: resolved === "upgrade" ? "upgrade" : "subscribe",
        balance,
        currency,
      }),
    [balance, currency, resolved, tier]
  );

  const confirm = useCallback(() => {
    // The pending marker (with its pre-payment baseline) is written by
    // useCheckoutActions once the Dodo session exists.
    if (resolved === "upgrade") {
      void startUpgrade(tier);
      return;
    }
    void startCheckout({ intent: "subscribe", tier });
  }, [resolved, startCheckout, startUpgrade, tier]);

  return {
    view,
    loading,
    busy,
    error,
    clearError,
    blocked: resolved === "downgrade_blocked" || resolved === "topup",
    confirm,
  };
};

export default useCheckoutReview;
