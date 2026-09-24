"use client";

import {
  trackQuotaHit,
  trackQuotaNudgeAction,
} from "@/lib/analytics/billing-events";
import type { AnalyticsSurface } from "@/lib/analytics/events";
import useCheckoutActions from "./useCheckoutActions";
import { useEntitlementBalance } from "./useEntitlementBalance";
import { checkoutPath, reviewPath } from "@/lib/billing/checkoutTier";
import { resolveQuotaNudge } from "@/lib/billing/quotaNudge";
import useDisplayCurrency from "./useDisplayCurrency";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export const useQuotaNudge = ({
  enabled,
  surface,
  onDismiss,
}: {
  enabled: boolean;
  surface: AnalyticsSurface;
  /** The caller's close; wrapped so a dismiss is counted. */
  onDismiss: () => void;
}) => {
  const { balance, loading } = useEntitlementBalance({ enabled });
  const { startCheckout, busy, error, clearError } = useCheckoutActions();
  const router = useRouter();
  const currency = useDisplayCurrency();
  const view = resolveQuotaNudge({ loading, balance, currency });

  // quota_hit once per showing — only when an actual nudge renders (not the
  // loading beat, not a dismiss/bypass outcome).
  const shown = view.kind === "subscribe" || view.kind === "topup";
  const hitTracked = useRef(false);
  useEffect(() => {
    if (!enabled) {
      hitTracked.current = false;
      return;
    }
    if (!shown || hitTracked.current) return;
    hitTracked.current = true;
    trackQuotaHit(surface);
  }, [enabled, shown, surface]);

  const onSubscribe = useCallback(() => {
    trackQuotaNudgeAction("subscribe");
    // `from` is an analytics source for plan_viewed on the picker, nothing else.
    router.push(`${checkoutPath("founding")}&from=quota_nudge`);
  }, [router]);

  const onTopUp = useCallback(() => {
    if (view.kind !== "topup") return;
    trackQuotaNudgeAction("topup");
    void startCheckout({ intent: "topup", tier: view.tier });
  }, [startCheckout, view]);

  const onUpgrade = useCallback(() => {
    if (view.kind !== "topup" || !view.nextTier) return;
    trackQuotaNudgeAction("upgrade");
    router.push(reviewPath(view.nextTier, "upgrade"));
  }, [router, view]);

  const dismiss = useCallback(() => {
    trackQuotaNudgeAction("dismiss");
    onDismiss();
  }, [onDismiss]);

  return {
    view,
    busy,
    error,
    clearError,
    onSubscribe,
    onTopUp,
    onUpgrade,
    onDismiss: dismiss,
  };
};

export default useQuotaNudge;
