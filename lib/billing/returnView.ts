/**
 * Checkout return copy (KAN-85 Phase 3a). The three actions tell three
 * different stories; none of them claims the balance has landed, because the
 * grant arrives by webhook after the redirect.
 */

import type { CheckoutReturnAction } from "@/lib/billing/checkoutReturn";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { TOP_UP_IDEAS } from "@/lib/billing/planView";
import { copy } from "@/lib/design/copy";

export type ReturnView = {
  eyebrow: string;
  title: string;
  body: string;
};

export const buildReturnView = ({
  action,
  tier,
}: {
  action: CheckoutReturnAction;
  tier: PaidCheckoutTier | null;
}): ReturnView => {
  const name = tier ? copy.checkout.packs[tier] : null;

  if (action === "topup") {
    return {
      eyebrow: copy.plan.returned.topup.eyebrow,
      title: copy.plan.returned.topup.title(TOP_UP_IDEAS),
      body: copy.plan.returned.topup.body,
    };
  }

  if (action === "upgrade") {
    return {
      eyebrow: copy.plan.returned.upgrade.eyebrow,
      title: name
        ? copy.plan.returned.upgrade.title(name)
        : copy.plan.returned.upgrade.titleNoTier,
      body: copy.plan.returned.upgrade.body,
    };
  }

  return {
    eyebrow: copy.plan.returned.subscribe.eyebrow,
    title: name
      ? copy.plan.returned.subscribe.title(name)
      : copy.plan.returned.subscribe.titleNoTier,
    body: copy.plan.returned.subscribe.body,
  };
};
