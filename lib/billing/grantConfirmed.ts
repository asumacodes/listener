/**
 * The one rule for "the payment landed" (KAN-85 trust fix).
 *
 * A grant is confirmed only when a `get_effective_balance` read has moved past
 * the baseline captured before the Dodo handoff. Return URLs, `?action=`,
 * Dodo's `status` and the marker itself are never evidence — and a tier that
 * merely *equals* the purchase is not either (it may have been held already).
 *
 * Pure — no React, no I/O.
 */

import type { CheckoutPending } from "@/lib/billing/checkoutPending";
import type { EffectiveBalance } from "@/types/billing";

type GrantFields = Pick<
  EffectiveBalance,
  "current_tier" | "subscription_reset_at" | "purchased_balance"
>;

export const isGrantConfirmed = (
  pending: CheckoutPending,
  balance: GrantFields
): boolean => {
  const base = pending.baseline;
  // No baseline (legacy marker / failed pre-checkout read): nothing to compare
  // against, so it can never confirm.
  if (!base) return false;

  if (pending.action === "topup") {
    // Strictly greater: an unpaid top-up leaves purchased unchanged.
    return balance.purchased_balance > base.purchased_balance;
  }

  if (!pending.tier || balance.current_tier !== pending.tier) return false;
  // Right tier AND something moved: a new tier, or a fresh subscription cycle.
  return (
    balance.current_tier !== base.current_tier ||
    balance.subscription_reset_at !== base.subscription_reset_at
  );
};

/** Ideas a confirmed top-up actually added, read off the payload. */
export const confirmedTopUpCount = (
  pending: CheckoutPending,
  balance: GrantFields
): number =>
  pending.baseline
    ? Math.max(
        0,
        balance.purchased_balance - pending.baseline.purchased_balance
      )
    : 0;
