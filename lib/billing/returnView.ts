/**
 * Checkout return view model (KAN-85 Phase 3a, trust fix).
 *
 * Four phases, one rule: only `confirmed` celebrates, and its copy is built
 * from the balance payload. The return URL's `action` / `tier` may only pick
 * neutral wording for the confirming beat — they are never evidence.
 *
 * Pure derivation — no React, no I/O.
 */

import type { CheckoutPending } from "@/lib/billing/checkoutPending";
import type { CheckoutReturnAction } from "@/lib/billing/checkoutReturn";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { confirmedTopUpCount } from "@/lib/billing/grantConfirmed";
import { buildConfirmedView } from "@/lib/billing/welcomeView";
import { copy } from "@/lib/design/copy";
import type { BalanceDisplay } from "@/types/billing";

export type ReturnPhase = "confirming" | "confirmed" | "failed" | "timeout";

export type ReturnView = {
  phase: ReturnPhase;
  eyebrow: string;
  title: string;
  body: string;
};

const r = copy.plan.returned;

export const buildConfirmingView = ({
  action,
  tier,
}: {
  action: CheckoutReturnAction;
  tier: PaidCheckoutTier | null;
}): ReturnView => {
  const name = tier ? copy.checkout.packs[tier] : null;
  return {
    phase: "confirming",
    eyebrow: r.confirming.eyebrow,
    title: r.confirming.title,
    body:
      action === "topup"
        ? r.confirming.bodyTopup
        : name
          ? r.confirming.bodyPlan(name)
          : r.confirming.bodyPlanNoTier,
  };
};

/** Call only after isGrantConfirmed(pending, balance) returned true. */
export const buildConfirmedReturnView = ({
  pending,
  balance,
  now,
}: {
  pending: CheckoutPending;
  balance: BalanceDisplay;
  now?: Date;
}): ReturnView => {
  if (pending.action === "topup") {
    return {
      phase: "confirmed",
      eyebrow: r.topup.eyebrow,
      title: r.topup.title(confirmedTopUpCount(pending, balance)),
      body: r.topup.body,
    };
  }
  const view = buildConfirmedView({ balance, pending, now });
  return {
    phase: "confirmed",
    eyebrow: view.eyebrow,
    title: view.title,
    body: view.body,
  };
};

export const buildFailedView = (): ReturnView => ({
  phase: "failed",
  eyebrow: r.failed.eyebrow,
  title: r.failed.title,
  body: r.failed.body,
});

export const buildTimeoutView = (): ReturnView => ({
  phase: "timeout",
  eyebrow: r.timeout.eyebrow,
  title: r.timeout.title,
  body: r.timeout.body,
});
