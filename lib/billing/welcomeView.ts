/**
 * Post-checkout welcome view model (KAN-85 Phase 3b).
 *
 * Two beats, one rule: the arriving beat may name the tier the user chose and
 * nothing else; the confirmed beat may only say what `get_effective_balance`
 * already says. Founding in particular is unknowable until the payload lands,
 * so no "double" language exists on the arriving side.
 *
 * Pure derivation — no React, no I/O, sibling of planView / returnView.
 */

import type { CheckoutPending } from "@/lib/billing/checkoutPending";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import { foundingActive, ideaNoun, tierName } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";
import { formatPlanDate } from "@/lib/format-date";
import type { BalanceDisplay } from "@/types/billing";

export type ArrivingView = {
  eyebrow: string;
  title: string;
  body: string;
  /** Past the fast-poll window — different line, and a support way out. */
  slow: boolean;
  actionLabel: string;
};

export type PlanWelcomeVariant = "founding" | "regular" | "upgrade";

export type ConfirmedView = {
  variant: PlanWelcomeVariant;
  /** The month's allowance as granted — `subscription_grant_remaining`. */
  count: number;
  eyebrow: string;
  title: string;
  body: string;
};

export const buildArrivingView = ({
  tier,
  slow,
}: {
  tier: PaidCheckoutTier;
  slow: boolean;
}): ArrivingView => {
  const name = copy.checkout.packs[tier];
  return {
    eyebrow: copy.plan.welcome.arrivingEyebrow,
    title: slow
      ? copy.plan.welcome.slowTitle(name)
      : copy.plan.welcome.arrivingTitle(name),
    body: slow ? copy.plan.welcome.slowBody : copy.plan.welcome.arrivingBody,
    slow,
    actionLabel: slow
      ? copy.plan.welcome.supportLink
      : copy.plan.welcome.planLink,
  };
};

/**
 * Founding wins over upgrade: the doubling is the bigger news, and its copy
 * already states the new allowance. `from_tier` is only ever set for upgrades.
 */
export const planWelcomeVariant = ({
  balance,
  pending,
  now,
}: {
  balance: BalanceDisplay;
  pending: CheckoutPending;
  now?: Date;
}): PlanWelcomeVariant => {
  if (foundingActive(balance, now)) return "founding";
  return pending.from_tier ? "upgrade" : "regular";
};

export const buildConfirmedView = ({
  balance,
  pending,
  now,
}: {
  balance: BalanceDisplay;
  pending: CheckoutPending;
  now?: Date;
}): ConfirmedView => {
  const variant = planWelcomeVariant({ balance, pending, now });
  const name = tierName(balance.current_tier);
  const count = Math.max(0, balance.subscription_grant_remaining);
  const noun = ideaNoun(count);
  const base = balance.current_tier
    ? DODO_PRODUCTS[balance.current_tier].ideas
    : null;
  const reset = balance.subscription_reset_at
    ? formatPlanDate(balance.subscription_reset_at)
    : "";
  const w = copy.plan.welcome;

  if (variant === "founding") {
    // Base is only null on Free, which can't reach a confirmed welcome; the
    // fallback keeps the copy honest rather than printing "double the usual 0".
    const body =
      base === null
        ? w.regular.bodyNoReset
        : reset
          ? w.founding.body(count, noun, base, reset)
          : w.founding.bodyNoReset(count, noun, base);
    return {
      variant,
      count,
      eyebrow: w.founding.eyebrow,
      title: w.founding.title(name),
      body,
    };
  }

  if (variant === "upgrade") {
    const prev = tierName(pending.from_tier);
    return {
      variant,
      count,
      eyebrow: w.upgraded.eyebrow,
      title: w.upgraded.title(name, count, noun),
      body: reset ? w.upgraded.body(prev, reset) : w.upgraded.bodyNoReset(prev),
    };
  }

  return {
    variant,
    count,
    eyebrow: w.regular.eyebrow,
    title: w.regular.title(name, count, noun),
    body: reset ? w.regular.body(reset) : w.regular.bodyNoReset,
  };
};
