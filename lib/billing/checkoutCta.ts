import { TIER_LADDER, type PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import type { BillingTier } from "@/types/billing";

export type PaidCheckoutAction =
  | "subscribe"
  | "topup"
  | "upgrade"
  | "downgrade_blocked";

export const resolvePaidCheckoutAction = (
  selected: PaidCheckoutTier,
  currentTier: BillingTier | null
): PaidCheckoutAction => {
  if (!currentTier) return "subscribe";
  if (currentTier === selected) return "topup";
  if (TIER_LADDER[selected] > TIER_LADDER[currentTier]) return "upgrade";
  return "downgrade_blocked";
};

export const nextPaidTier = (
  tier: PaidCheckoutTier
): PaidCheckoutTier | null => {
  if (tier === "starter") return "builder";
  if (tier === "builder") return "studio";
  return null;
};
