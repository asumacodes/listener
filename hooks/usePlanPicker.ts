"use client";

import {
  trackPlanViewed,
  trackTierSelected,
  type PlanViewSource,
} from "@/lib/analytics/billing-events";
import useDisplayCurrency from "@/hooks/useDisplayCurrency";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import useFoundingCounter from "@/hooks/useFoundingCounter";
import { reviewPath } from "@/lib/billing/checkoutTier";
import { pickerFounding, type FoundingView } from "@/lib/billing/foundingView";
import {
  buildTierOptions,
  foundingActive,
  tierName,
  type TierOption,
} from "@/lib/billing/planView";
import type { BalanceDisplay } from "@/types/billing";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

export type PlanPicker = {
  tiers: TierOption[];
  /** Founding-offer callout, or null when the offer can't apply to this viewer. */
  callout: FoundingView | null;
  currentName: string;
  /** Hands a subscribe / upgrade tap to the pre-checkout review. */
  choose: (option: TierOption) => void;
};

/**
 * Tier cards + founding callout for a known balance. Currency and founding
 * count are display-only: `choose` navigates to /checkout/review with just
 * tier + action — nothing geo- or count-related travels further.
 */
export const usePlanPicker = ({
  balance,
}: {
  balance: BalanceDisplay | null;
}): PlanPicker => {
  const router = useRouter();
  const currency = useDisplayCurrency();
  const founding = useFoundingCounter();
  const currentTier = balance?.current_tier ?? null;
  const viewerFoundingActive = balance ? foundingActive(balance) : false;

  const { callout, showLines } = pickerFounding({
    currentTier,
    viewerFoundingActive,
    founding,
  });

  const tiers = useMemo(
    () =>
      buildTierOptions({ currentTier, showFoundingLines: showLines, currency }),
    [currentTier, showLines, currency]
  );

  const foundingOfferShown = callout !== null && callout.kind !== "full";
  const choose = useCallback(
    (option: TierOption) => {
      if (option.action !== "subscribe" && option.action !== "upgrade") return;
      trackTierSelected(option.tier, foundingOfferShown);
      router.push(reviewPath(option.tier, option.action));
    },
    [foundingOfferShown, router]
  );

  return { tiers, callout, currentName: tierName(currentTier), choose };
};

/**
 * Stand-alone picker (desktop /account/plan/choose, /checkout?tier=founding):
 * reads its own balance and reports `loading` so the screen can skeleton
 * instead of showing every tier as "Subscribe" to an existing subscriber.
 */
export const usePlanChoose = ({
  viewSource,
}: {
  /** plan_viewed source for this surface; null when it isn't a plan picker. */
  viewSource: PlanViewSource | null;
}): PlanPicker & { loading: boolean } => {
  const { balance, loading } = useEntitlementBalance();
  const picker = usePlanPicker({ balance });

  const viewed = useRef(false);
  useEffect(() => {
    if (!viewSource || viewed.current) return;
    viewed.current = true;
    trackPlanViewed(viewSource);
  }, [viewSource]);

  return { ...picker, loading: loading && !balance };
};

export default usePlanPicker;
