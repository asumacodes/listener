"use client";

import { useCheckoutActions } from "@/hooks/useCheckoutActions";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { reviewPath } from "@/lib/billing/checkoutTier";
import {
  buildPlanView,
  buildTierOptions,
  buildTopUpOptions,
  type PlanView,
  type TierOption,
  type TopUpOption,
} from "@/lib/billing/planView";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export type PlanSheet = "choose" | "topup" | "cancel" | null;

type UsePlanUsage = {
  view: PlanView | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  tiers: TierOption[];
  topUps: TopUpOption[];
  sheet: PlanSheet;
  openSheet: (next: Exclude<PlanSheet, null>) => void;
  closeSheet: () => void;
  /** Tier row tapped in the picker — hands off to the pre-checkout review. */
  chooseTier: (option: TierOption) => void;
  startTopUp: (option: TopUpOption) => void;
  confirmCancel: () => Promise<void>;
  resumePlan: () => Promise<void>;
};

/**
 * Plan & usage orchestration (KAN-85 Phase 3a). Owns which sheet is open and
 * when the balance is re-read; the screens stay presentational and the numbers
 * come from buildPlanView.
 *
 * Refetch on focus mirrors PlanSection: Dodo checkout and the billing portal
 * both happen in another tab, and the webhook lands while we are away.
 */
export const usePlanUsage = (): UsePlanUsage => {
  const router = useRouter();
  const { balance, loading, refetch } = useEntitlementBalance();
  const {
    startCheckout,
    busy: checkoutBusy,
    error: checkoutError,
  } = useCheckoutActions();
  const {
    busy: subBusy,
    error: subError,
    scheduled,
    scheduleCancel,
    resume,
  } = useSubscriptionActions({
    serverEndsAt: balance?.subscription_ends_at ?? null,
  });
  const [sheet, setSheet] = useState<PlanSheet>(null);

  useEffect(() => {
    const onFocus = () => {
      void refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refetch]);

  const view = useMemo(
    () =>
      balance ? buildPlanView({ balance, cancelScheduled: scheduled }) : null,
    [balance, scheduled]
  );

  const tiers = useMemo(
    () =>
      buildTierOptions({
        currentTier: balance?.current_tier ?? null,
        founding: view?.founding ?? false,
      }),
    [balance?.current_tier, view?.founding]
  );

  const topUps = useMemo(
    () => buildTopUpOptions(balance?.current_tier ?? null),
    [balance?.current_tier]
  );

  const closeSheet = useCallback(() => setSheet(null), []);

  const chooseTier = useCallback(
    (option: TierOption) => {
      if (option.action !== "subscribe" && option.action !== "upgrade") return;
      setSheet(null);
      router.push(reviewPath(option.tier, option.action));
    },
    [router]
  );

  const startTopUp = useCallback(
    (option: TopUpOption) => {
      if (option.intent === "payg") {
        void startCheckout({ intent: "payg" });
        return;
      }
      if (!option.tier) return;
      void startCheckout({ intent: "topup", tier: option.tier });
    },
    [startCheckout]
  );

  const confirmCancel = useCallback(async () => {
    const ok = await scheduleCancel();
    if (ok) {
      setSheet(null);
      void refetch();
    }
  }, [refetch, scheduleCancel]);

  const resumePlan = useCallback(async () => {
    const ok = await resume();
    if (ok) void refetch();
  }, [refetch, resume]);

  return {
    view,
    loading: loading && !balance,
    busy: checkoutBusy || subBusy,
    error: checkoutError ?? subError,
    tiers,
    topUps,
    sheet,
    openSheet: setSheet,
    closeSheet,
    chooseTier,
    startTopUp,
    confirmCancel,
    resumePlan,
  };
};

export default usePlanUsage;
