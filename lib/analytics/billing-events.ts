/**
 * Plan / checkout analytics. Rides the existing PostHog client — no new setup.
 *
 * Every capture is fire-and-forget and swallowed on error: analytics never
 * blocks or gates a billing action. Money/grant truth (checkout_completed,
 * founding_slot_claimed) is emitted ONLY from a confirmed grant — a balance
 * read that passed isGrantConfirmed — never from a redirect, URL param or the
 * pending marker. Display/interaction only; nothing here touches billing.
 *
 * Deliberately NOT emitted: upgrade_started / topup_started — checkout_started
 * already carries `intent`, so they would double-count the same action.
 */

import type { CheckoutPending } from "@/lib/billing/checkoutPending";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { foundingActive } from "@/lib/billing/planView";
import type { BalanceDisplay } from "@/types/billing";
import type { AnalyticsSurface } from "./events";
import { posthog } from "./posthog-client";

export type PlanViewSource = "quota_nudge" | "account" | "gtm" | "other";
export type CheckoutIntentProp = "subscribe" | "upgrade" | "topup" | "payg";
export type QuotaNudgeAction = "subscribe" | "topup" | "upgrade" | "dismiss";

type Props = Record<string, string | number | boolean | null>;

/** Never throws, never awaits — a failed capture must not break checkout. */
const capture = (
  event: string,
  props?: Props,
  options?: { beforeNavigation?: boolean }
): void => {
  try {
    posthog?.capture(
      event,
      props,
      options?.beforeNavigation
        ? // We hand off to Dodo right after; don't leave it in the batch queue.
          { send_instantly: true, transport: "sendBeacon" }
        : undefined
    );
  } catch {
    // analytics is best-effort
  }
};

// ── Core funnel ──────────────────────────────────────────────────────────────

export const trackPlanViewed = (source: PlanViewSource) =>
  capture("plan_viewed", { source });

export const trackTierSelected = (
  tier: PaidCheckoutTier,
  foundingOfferShown: boolean
) =>
  capture("tier_selected", { tier, founding_offer_shown: foundingOfferShown });

/** Session/changePlan succeeded and we're redirecting to Dodo. */
export const trackCheckoutStarted = (
  tier: PaidCheckoutTier | null,
  intent: CheckoutIntentProp
) => capture("checkout_started", { tier, intent }, { beforeNavigation: true });

/**
 * /checkout/review rendered a real review (subscribe or upgrade) — the step
 * between tier_selected and checkout_started where price / statement drop-off
 * happens. Not fired for a blocked (already-on / downgrade) review.
 */
export const trackCheckoutReviewViewed = (
  tier: PaidCheckoutTier,
  intent: "subscribe" | "upgrade"
) => capture("checkout_review_viewed", { tier, intent });

export const trackCheckoutFailed = (intent: CheckoutIntentProp) =>
  capture("checkout_failed", { intent });

/**
 * "Started paying on THIS device, didn't finish": a Timeout with a checkout
 * marker. A return with no marker (e.g. paid on another device) is "can't
 * tell", not abandoned — callers must not fire this for it.
 */
export const trackCheckoutAbandoned = (intent: CheckoutIntentProp) =>
  capture("checkout_abandoned", { intent });

// ── Plan management ──────────────────────────────────────────────────────────

export const trackCancelClicked = () => capture("cancel_clicked");
export const trackCancelConfirmed = () => capture("cancel_confirmed");
export const trackResumeClicked = () => capture("resume_clicked");

// ── Quota nudge ──────────────────────────────────────────────────────────────

export const trackQuotaHit = (surface: AnalyticsSurface) =>
  capture("quota_hit", { surface });

export const trackQuotaNudgeAction = (action: QuotaNudgeAction) =>
  capture("quota_nudge_action", { action });

// ── Grant truth (confirmed balance only) ─────────────────────────────────────

/** The marker's action as the analytics intent (a tierless top-up is PAYG). */
export const intentForPending = (
  pending: Pick<CheckoutPending, "action" | "tier">
): CheckoutIntentProp =>
  pending.action === "topup" && !pending.tier ? "payg" : pending.action;

export type ConfirmedGrantEvents = {
  completed: {
    tier: PaidCheckoutTier | null;
    intent: CheckoutIntentProp;
    is_founding: boolean;
  };
  /** Present only when this grant is the one that made the user founding. */
  foundingClaimed: { tier: PaidCheckoutTier } | null;
};

/**
 * Pure: what a CONFIRMED grant says. Call only after isGrantConfirmed passed.
 * founding_slot_claimed needs proof of the transition: the pre-checkout
 * baseline recorded founding_member=false and the confirmed balance shows
 * true. A baseline without that field (older marker) proves nothing → no event.
 *
 * ⚠️ founding_slot_claimed is a LOSSY trend signal, not a count: it only fires
 * when the buyer comes back to the app after paying. The authoritative number
 * of founding claims is public.founding_counter.claimed in the DB — never
 * build a launch dashboard that counts this event as the total.
 */
export const confirmedGrantEvents = (
  pending: CheckoutPending,
  balance: BalanceDisplay,
  now: Date = new Date()
): ConfirmedGrantEvents => {
  const intent = intentForPending(pending);
  const planGrant =
    pending.action === "subscribe" || pending.action === "upgrade";
  const claimed =
    pending.action === "subscribe" &&
    !!pending.tier &&
    pending.baseline?.founding_member === false &&
    balance.founding_member === true;
  return {
    completed: {
      tier: pending.tier,
      intent,
      is_founding: planGrant && foundingActive(balance, now),
    },
    foundingClaimed: claimed && pending.tier ? { tier: pending.tier } : null,
  };
};

/**
 * Once per checkout, across the return screen and the studio welcome (both
 * confirm the same grant) and across tabs — keyed on the marker's own
 * timestamp, which is unique per checkout.
 */
const grantKey = (userId: string, pending: CheckoutPending) =>
  `mm_grant_tracked:${userId}:${pending.ts}`;

export const trackConfirmedGrant = (
  userId: string,
  pending: CheckoutPending,
  balance: BalanceDisplay
): void => {
  try {
    const key = grantKey(userId, pending);
    if (window.localStorage.getItem(key) === "1") return;
    window.localStorage.setItem(key, "1");
  } catch {
    // Storage unavailable: still emit — a rare duplicate beats a lost grant.
  }
  const events = confirmedGrantEvents(pending, balance);
  capture("checkout_completed", events.completed);
  if (events.foundingClaimed) {
    capture("founding_slot_claimed", events.foundingClaimed);
  }
};
