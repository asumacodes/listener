/**
 * Founding-offer callout view model (design 03).
 *
 * Speaks in spots REMAINING, never claimed:
 *   - read missing / loading / failed → `static` (variant A): the offer, no number.
 *     Never "0 spots left" or a broken count on a bad read.
 *   - claimed < 10          → `open`:  "Open now", bar near-full, no number.
 *   - 10+ claimed, 10+ left → `count`: "N of 50 left", bar draining.
 *   - fewer than 10 left    → `last`:  "Last N".
 *   - none left             → `full`:  one-line muted note; founding lines hide.
 * Scarcity is gold, never red.
 *
 * Display only. Pure — no React, no I/O.
 */

import { DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import { PAID_CHECKOUT_TIERS } from "@/lib/billing/checkoutTier";
import type { BillingTier } from "@/types/billing";

export type FoundingCounter = { claimed: number; cap: number };

/** Below this many claimed, show no number at all. */
const QUIET_BELOW_CLAIMED = 10;
/** Below this many left, switch to "Last N". */
const LAST_BELOW_LEFT = 10;
/** Where the bar rests while quiet — full enough to read as "plenty". */
const QUIET_FILL = 0.97;

export type FoundingView =
  | { kind: "static" }
  | { kind: "open"; fill: number }
  | { kind: "count"; left: number; cap: number; fill: number }
  | { kind: "last"; left: number; cap: number; fill: number }
  | { kind: "full" };

const isUsable = (
  c: FoundingCounter | null | undefined
): c is FoundingCounter =>
  !!c &&
  Number.isInteger(c.claimed) &&
  Number.isInteger(c.cap) &&
  c.cap > 0 &&
  c.claimed >= 0 &&
  c.claimed <= c.cap;

export const buildFoundingView = (
  counter: FoundingCounter | null | undefined
): FoundingView => {
  if (!isUsable(counter)) return { kind: "static" };
  const left = counter.cap - counter.claimed;
  if (left <= 0) return { kind: "full" };
  if (counter.claimed < QUIET_BELOW_CLAIMED) {
    return { kind: "open", fill: QUIET_FILL };
  }
  const fill = left / counter.cap;
  if (left < LAST_BELOW_LEFT) {
    return { kind: "last", left, cap: counter.cap, fill };
  }
  return { kind: "count", left, cap: counter.cap, fill };
};

/** The doubled allowances, from config — "10, 30 or 60". */
export const foundingAllowances = (): number[] =>
  PAID_CHECKOUT_TIERS.map((tier) => DODO_PRODUCTS[tier].ideas * 2);

/**
 * What the picker may promise this viewer. grant_subscription claims a
 * founding spot only on a FIRST paid subscribe; grant_upgrade keeps an existing
 * member's doubling but never claims one. So:
 *   - no plan yet     → the offer callout + doubled lines (unless full)
 *   - founding member → doubled lines (their upgrades stay doubled), no offer
 *   - other payer     → neither (the offer can't apply to them)
 */
export const pickerFounding = ({
  currentTier,
  viewerFoundingActive,
  founding,
}: {
  currentTier: BillingTier | null;
  viewerFoundingActive: boolean;
  founding: FoundingView;
}): { callout: FoundingView | null; showLines: boolean } => {
  if (viewerFoundingActive) return { callout: null, showLines: true };
  if (currentTier) return { callout: null, showLines: false };
  return { callout: founding, showLines: founding.kind !== "full" };
};
