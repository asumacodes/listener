"use client";

import {
  trackCancelClicked,
  trackCancelConfirmed,
  trackPlanViewed,
  trackResumeClicked,
} from "@/lib/analytics/billing-events";
import { useCheckoutActions } from "@/hooks/useCheckoutActions";
import useDisplayCurrency from "@/hooks/useDisplayCurrency";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { usePlanPicker } from "@/hooks/usePlanPicker";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import type { FoundingView } from "@/lib/billing/foundingView";
import {
  buildPlanView,
  buildTopUpOptions,
  type PlanView,
  type TierOption,
  type TopUpOption,
} from "@/lib/billing/planView";
import { useCallback, useEffect, useMemo, useState } from "react";

export type PlanSheet = "choose" | "topup" | "cancel" | null;

type UsePlanUsage = {
  view: PlanView | null;
  loading: boolean;
  busy: boolean;
  /** A Dodo checkout (top-up / pay-as-you-go) session is being opened. */
  checkoutOpening: boolean;
  /** The Dodo billing portal is being opened. */
  portalOpening: boolean;
  error: string | null;
  tiers: TierOption[];
  /** Founding-offer callout for the picker, or null when it can't apply. */
  foundingCallout: FoundingView | null;
  topUps: TopUpOption[];
  sheet: PlanSheet;
  openSheet: (next: Exclude<PlanSheet, null>) => void;
  closeSheet: () => void;
  /** Tier row tapped in the picker — hands off to the pre-checkout review. */
  chooseTier: (option: TierOption) => void;
  startTopUp: (option: TopUpOption) => void;
  confirmCancel: () => Promise<void>;
  resumePlan: () => Promise<void>;
  openPortal: () => Promise<void>;
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
  const { balance, loading, refetch } = useEntitlementBalance();
  const currency = useDisplayCurrency();
  const {
    startCheckout,
    openPortal,
    busy: checkoutBusy,
    pending: checkoutPending,
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
      balance
        ? buildPlanView({ balance, currency, cancelScheduled: scheduled })
        : null,
    [balance, currency, scheduled]
  );

  const picker = usePlanPicker({ balance });

  const topUps = useMemo(
    () => buildTopUpOptions(balance?.current_tier ?? null, currency),
    [balance?.current_tier, currency]
  );

  const closeSheet = useCallback(() => setSheet(null), []);

  const openSheet = useCallback((next: Exclude<PlanSheet, null>) => {
    // Plan & usage is the only entry to the mobile picker sheet.
    if (next === "choose") trackPlanViewed("account");
    if (next === "cancel") trackCancelClicked();
    setSheet(next);
  }, []);

  const { choose } = picker;
  const chooseTier = useCallback(
    (option: TierOption) => {
      setSheet(null);
      choose(option);
    },
    [choose]
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
      trackCancelConfirmed();
      setSheet(null);
      void refetch();
    }
  }, [refetch, scheduleCancel]);

  const resumePlan = useCallback(async () => {
    trackResumeClicked();
    const ok = await resume();
    if (ok) void refetch();
  }, [refetch, resume]);

  return {
    view,
    loading: loading && !balance,
    busy: checkoutBusy || subBusy,
    checkoutOpening: checkoutPending === "checkout",
    portalOpening: checkoutPending === "portal",
    error: checkoutError ?? subError,
    tiers: picker.tiers,
    foundingCallout: picker.callout,
    topUps,
    sheet,
    openSheet,
    closeSheet,
    chooseTier,
    startTopUp,
    confirmCancel,
    resumePlan,
    openPortal,
  };
};

export default usePlanUsage;
