import { nextPaidTier } from "@/lib/billing/checkoutCta";
import {
  formatSubscriptionPrice,
  formatTopUpPrice,
} from "@/lib/billing/dodoDisplay";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import type { BalanceDisplay } from "@/types/billing";

export type QuotaNudgeView =
  | { kind: "loading" }
  | { kind: "dismiss" }
  | { kind: "subscribe" }
  | {
      kind: "topup";
      tier: PaidCheckoutTier;
      topUpPrice: string;
      nextTier: PaidCheckoutTier | null;
      nextPrice: string | null;
    };

export const resolveQuotaNudge = (input: {
  loading: boolean;
  balance: BalanceDisplay | null;
}): QuotaNudgeView => {
  if (input.loading) return { kind: "loading" };
  const balance = input.balance;
  if (!balance || balance.bypass) return { kind: "dismiss" };
  if (balance.current_tier === null) return { kind: "subscribe" };
  if (balance.effectiveRemaining === 0) {
    const nextTier = nextPaidTier(balance.current_tier);
    return {
      kind: "topup",
      tier: balance.current_tier,
      topUpPrice: formatTopUpPrice(balance.current_tier),
      nextTier,
      nextPrice: nextTier ? formatSubscriptionPrice(nextTier) : null,
    };
  }
  return { kind: "dismiss" };
};
