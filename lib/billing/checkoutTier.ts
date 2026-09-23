/**
 * GTM checkout SKUs. Distinct from DB BillingTier (starter|builder|studio):
 * payg and founding are checkout packs, not user_entitlements.current_tier.
 */

export const CHECKOUT_TIERS = [
  "starter",
  "builder",
  "studio",
  "payg",
  "founding",
] as const;

export type CheckoutTier = (typeof CHECKOUT_TIERS)[number];

const TIER_SET: ReadonlySet<string> = new Set(CHECKOUT_TIERS);

export const parseCheckoutTier = (
  raw: string | null | undefined
): CheckoutTier | null => {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  return TIER_SET.has(slug) ? (slug as CheckoutTier) : null;
};

export const checkoutPath = (tier: CheckoutTier): string =>
  `/checkout?tier=${tier}`;

export const PAID_CHECKOUT_TIERS = ["starter", "builder", "studio"] as const;

export type PaidCheckoutTier = (typeof PAID_CHECKOUT_TIERS)[number];

const PAID_SET: ReadonlySet<string> = new Set(PAID_CHECKOUT_TIERS);

export const parsePaidCheckoutTier = (
  raw: string | null | undefined
): PaidCheckoutTier | null => {
  const slug = parseCheckoutTier(raw);
  return slug && PAID_SET.has(slug) ? (slug as PaidCheckoutTier) : null;
};

export const TIER_LADDER: Record<PaidCheckoutTier, number> = {
  starter: 0,
  builder: 1,
  studio: 2,
};

/**
 * Pre-checkout review (KAN-85 Phase 3a). Price is copy on this screen, never a
 * button — the only action is handing off to Dodo.
 */
export const REVIEW_ACTIONS = ["subscribe", "upgrade"] as const;

export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

const REVIEW_SET: ReadonlySet<string> = new Set(REVIEW_ACTIONS);

export const parseReviewAction = (
  raw: string | null | undefined
): ReviewAction | null => {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  return REVIEW_SET.has(slug) ? (slug as ReviewAction) : null;
};

export const reviewPath = (
  tier: PaidCheckoutTier,
  action: ReviewAction
): string => `/checkout/review?tier=${tier}&action=${action}`;
