/**
 * Plan & usage view model (KAN-85 Phase 3a).
 *
 * Pure derivation from the entitlement balance — no React, no I/O. Every number
 * comes from `get_effective_balance`; tier bases come from the Dodo product
 * config, which mirrors `public.entitlement_tier_base` (starter 5 / builder 15 /
 * studio 30) and the founding x2 rule in `grant_subscription`.
 *
 * The two balances are never merged: the monthly allowance
 * (`subscription_grant_remaining`) and extra ideas (`purchased_balance`) each
 * get their own card. The extra card is omitted at zero. `effectiveRemaining`
 * is the only place they add up.
 */

import {
  PAID_CHECKOUT_TIERS,
  TIER_LADDER,
  type PaidCheckoutTier,
} from "@/lib/billing/checkoutTier";
import { DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import {
  formatPaygPrice,
  formatSubscriptionPrice,
  formatTopUpPrice,
} from "@/lib/billing/dodoDisplay";
import { copy } from "@/lib/design/copy";
import {
  formatMonthYear,
  formatPlanDate,
  formatShortDate,
} from "@/lib/format-date";
import type { BalanceDisplay, BillingTier } from "@/types/billing";

/** Free tier allowance — one idea, granted once, never reset. */
export const FREE_GRANT_TOTAL = 1;

/** One top-up checkout line is quantity 1, so one purchase is one extra idea. */
export const TOP_UP_IDEAS = 1;

export const ideaNoun = (n: number): string => (n === 1 ? "idea" : "ideas");

export const tierName = (tier: BillingTier | null): string =>
  tier ? copy.checkout.packs[tier] : copy.plan.free;

/** Founding doubles the allowance only while the 12-month window is open. */
export const foundingActive = (
  balance: Pick<BalanceDisplay, "founding_member" | "founding_expires_at">,
  now: Date = new Date()
): boolean => {
  if (!balance.founding_member) return false;
  if (!balance.founding_expires_at) return false;
  const expires = new Date(balance.founding_expires_at);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() > now.getTime();
};

export type PlanView = {
  tier: BillingTier | null;
  name: string;
  isFree: boolean;
  isTopTier: boolean;
  founding: boolean;
  foundingUntil: string | null;
  cancelScheduled: boolean;
  /** Formatted date the plan lapses (or resets when nothing is scheduled). */
  periodEnd: string | null;
  price: string;
  priceSuffix: string;
  ideasLine: string;
  /** Tier base before the founding multiplier. Null on Free. */
  base: number | null;
  allowance: number;
  remaining: number;
  used: number;
  /** 0–100, already clamped — feed straight into a meter width. */
  pct: number;
  remainingNoun: string;
  allowanceEyebrow: string;
  allowanceLower: string;
  resetLine: string;
  allowanceMeta: string;
  extra: number;
  extraNoun: string;
  total: number;
  showUpgrade: boolean;
  /** Purchased balance is its own card. Hidden at zero so it isn't a second "0". */
  showExtra: boolean;
  showCancel: boolean;
  upgradeLabel: string;
  /** Free buys a single idea (pay as you go). Subscribers top up their tier. */
  addonLabel: string;
  /** Account-row subtitle — "Builder · 9 ideas left · resets Oct 4". */
  rowSub: string;
};

type BuildPlanViewInput = {
  balance: BalanceDisplay;
  /** Optimistic cancellation state from useSubscriptionActions, when known. */
  cancelScheduled?: boolean;
  now?: Date;
};

export const buildPlanView = ({
  balance,
  cancelScheduled,
  now = new Date(),
}: BuildPlanViewInput): PlanView => {
  const tier = balance.current_tier;
  const isFree = !tier;
  const founding = foundingActive(balance, now);
  const base = tier ? DODO_PRODUCTS[tier].ideas : null;

  const remaining = Math.max(
    0,
    isFree ? balance.free_grant_remaining : balance.subscription_grant_remaining
  );
  const nominalAllowance =
    base === null ? FREE_GRANT_TOTAL : founding ? base * 2 : base;
  // A grant can outlive the rule that sized it (founding lapsing mid-cycle,
  // an operator top-up). Never render "17 of 15 left".
  const allowance = Math.max(nominalAllowance, remaining);
  const used = allowance - remaining;
  const pct = allowance > 0 ? Math.round((remaining / allowance) * 100) : 0;

  const scheduled = cancelScheduled ?? Boolean(balance.subscription_ends_at);
  const endsAt = balance.subscription_ends_at ?? balance.subscription_reset_at;

  const extra = Math.max(0, balance.purchased_balance);

  return {
    tier,
    name: tierName(tier),
    isFree,
    isTopTier: tier === "studio",
    founding,
    foundingUntil: balance.founding_expires_at
      ? formatMonthYear(balance.founding_expires_at)
      : null,
    cancelScheduled: !isFree && scheduled,
    periodEnd: endsAt ? formatPlanDate(endsAt) : null,
    price: tier ? formatSubscriptionPrice(tier) : copy.plan.free,
    priceSuffix: tier ? copy.plan.perMonth : "",
    ideasLine:
      base === null ? copy.plan.freeIdeasLine : copy.plan.ideasLine(base),
    base,
    allowance,
    remaining,
    used,
    pct: Math.min(100, Math.max(0, pct)),
    remainingNoun: ideaNoun(allowance),
    allowanceEyebrow: isFree
      ? copy.plan.freeAllowance
      : copy.plan.monthlyAllowance,
    allowanceLower: isFree
      ? copy.plan.freeAllowanceLower
      : copy.plan.monthlyAllowanceLower,
    resetLine:
      isFree || !balance.subscription_reset_at
        ? copy.plan.noReset
        : copy.plan.resetsOn(formatPlanDate(balance.subscription_reset_at)),
    allowanceMeta:
      base === null
        ? copy.plan.allowanceMetaFree
        : founding
          ? copy.plan.allowanceMetaFounding(base, allowance)
          : copy.plan.allowanceMetaTier(base, tierName(tier)),
    extra,
    extraNoun: ideaNoun(extra),
    total: balance.effectiveRemaining,
    showUpgrade: tier !== "studio",
    showExtra: extra > 0,
    showCancel: !isFree && !scheduled,
    upgradeLabel: isFree ? copy.plan.choosePlan : copy.plan.upgrade,
    addonLabel: isFree ? copy.plan.payAsYouGo : copy.plan.topUp,
    rowSub: isFree
      ? copy.plan.rowSubFree(remaining, ideaNoun(remaining))
      : copy.plan.rowSubPaid(
          tierName(tier),
          remaining,
          ideaNoun(remaining),
          balance.subscription_reset_at
            ? formatShortDate(balance.subscription_reset_at)
            : ""
        ),
  };
};

/** What tapping a tier row in "Choose a plan" can do, given the current tier. */
export type TierAction = "subscribe" | "upgrade" | "current" | "locked";

export type TierOption = {
  tier: PaidCheckoutTier;
  name: string;
  price: string;
  ideasLine: string;
  /** "· 30 while founding" — empty when the founding window is closed. */
  foundingLine: string;
  action: TierAction;
  cta: string | null;
};

const tierCta = (action: TierAction): string | null => {
  if (action === "subscribe") return copy.plan.choose.subscribeCta;
  if (action === "upgrade") return copy.plan.choose.upgradeCta;
  return null;
};

/**
 * Tier ladder for the picker. Downgrades are blocked upstream
 * (resolvePaidCheckoutAction), so a lower tier is rendered as locked rather
 * than offering a switch that would fail at checkout.
 */
export const buildTierOptions = ({
  currentTier,
  founding,
}: {
  currentTier: BillingTier | null;
  founding: boolean;
}): TierOption[] =>
  PAID_CHECKOUT_TIERS.map((tier) => {
    const pack = DODO_PRODUCTS[tier];
    const action: TierAction = !currentTier
      ? "subscribe"
      : tier === currentTier
        ? "current"
        : TIER_LADDER[tier] > TIER_LADDER[currentTier]
          ? "upgrade"
          : "locked";

    return {
      tier,
      name: copy.checkout.packs[tier],
      price: formatSubscriptionPrice(tier),
      ideasLine: copy.plan.choose.ideasPerMonth(pack.ideas),
      foundingLine: founding
        ? copy.plan.choose.foundingLine(pack.ideas * 2)
        : "",
      action,
      cta: tierCta(action),
    };
  });

/**
 * Top-up SKUs available to this account. Subscribers get their tier's
 * (cheaper) extra idea; everyone else gets pay-as-you-go. One line item per
 * checkout, quantity 1 — see handlePaymentSucceeded.
 */
export type TopUpOption = {
  id: string;
  label: string;
  price: string;
  intent: "topup" | "payg";
  tier?: PaidCheckoutTier;
};

export const buildTopUpOptions = (
  currentTier: BillingTier | null
): TopUpOption[] =>
  currentTier
    ? [
        {
          id: `topup-${currentTier}`,
          label: copy.plan.topUpSheet.idea(TOP_UP_IDEAS),
          price: formatTopUpPrice(currentTier),
          intent: "topup",
          tier: currentTier,
        },
      ]
    : [
        {
          id: "payg",
          label: copy.plan.topUpSheet.idea(TOP_UP_IDEAS),
          price: formatPaygPrice(),
          intent: "payg",
        },
      ];

/** Cheapest paid tier, for the Free-state "plans start at …" line. */
export const entryPlanPrice = (): string => formatSubscriptionPrice("starter");
