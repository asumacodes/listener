/**
 * Pre-checkout review view model (KAN-85 Phase 3a).
 *
 * Price is copy on this screen, never a button — the single action is the
 * hand-off to Dodo. Everything here is derived, no I/O.
 */

import type { ReviewAction } from "@/lib/billing/checkoutTier";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import { formatSubscriptionPrice } from "@/lib/billing/dodoDisplay";
import type { DisplayCurrency } from "@/lib/billing/currency";
import { foundingActive, ideaNoun, tierName } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";
import type { BalanceDisplay } from "@/types/billing";

export type ReviewView = {
  eyebrow: string;
  name: string;
  ideasLine: string;
  price: string;
  cadence: string;
  note1: string;
  note2: string;
  /** Whether to repeat the founding promise under the notes. */
  founding: boolean;
};

export const buildReviewView = ({
  tier,
  action,
  balance,
  currency,
  now = new Date(),
}: {
  tier: PaidCheckoutTier;
  action: ReviewAction;
  balance: BalanceDisplay | null;
  /** Display only — never sent to billing APIs. */
  currency: DisplayCurrency;
  now?: Date;
}): ReviewView => {
  const pack = DODO_PRODUCTS[tier];
  const founding = balance ? foundingActive(balance, now) : false;
  const currentTier = balance?.current_tier ?? null;
  // An upgrade moves the leftover subscription grant into purchased_balance
  // (grant_upgrade), so the honest promise is "they become extra ideas".
  const leftover = balance?.subscription_grant_remaining ?? 0;

  return {
    eyebrow:
      action === "upgrade"
        ? copy.plan.review.upgrade
        : copy.plan.review.subscribe,
    name: copy.checkout.packs[tier],
    ideasLine: copy.plan.review.ideasLine(
      pack.ideas,
      founding ? pack.ideas * 2 : null
    ),
    price: formatSubscriptionPrice(tier, currency),
    cadence: copy.plan.review.cadence,
    note1: copy.plan.review.note1,
    note2:
      action === "upgrade" && currentTier && leftover > 0
        ? copy.plan.review.noteCarryOver(
            leftover,
            tierName(currentTier),
            ideaNoun(leftover)
          )
        : copy.plan.review.noteExtraUntouched,
    // Already-founding members keep the doubling; everyone without a plan can
    // still claim one of the 50 slots.
    founding: founding || !currentTier,
  };
};
