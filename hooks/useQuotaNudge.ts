"use client";

import useCheckoutActions from "./useCheckoutActions";
import { useEntitlementBalance } from "./useEntitlementBalance";
import { checkoutPath, reviewPath } from "@/lib/billing/checkoutTier";
import { resolveQuotaNudge } from "@/lib/billing/quotaNudge";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useQuotaNudge = ({ enabled }: { enabled: boolean }) => {
  const { balance, loading } = useEntitlementBalance({ enabled });
  const { startCheckout, busy, error, clearError } = useCheckoutActions();
  const router = useRouter();
  const view = resolveQuotaNudge({ loading, balance });

  const onSubscribe = useCallback(() => {
    router.push(checkoutPath("founding"));
  }, [router]);

  const onTopUp = useCallback(() => {
    if (view.kind !== "topup") return;
    void startCheckout({ intent: "topup", tier: view.tier });
  }, [startCheckout, view]);

  const onUpgrade = useCallback(() => {
    if (view.kind !== "topup" || !view.nextTier) return;
    router.push(reviewPath(view.nextTier, "upgrade"));
  }, [router, view]);

  return {
    view,
    busy,
    error,
    clearError,
    onSubscribe,
    onTopUp,
    onUpgrade,
  };
};

export default useQuotaNudge;
