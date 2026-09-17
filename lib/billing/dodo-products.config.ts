/**
 * Dodo Payments — product config map (KAN-85, Phase 1)
 * =====================================================
 *
 * Single source of truth mapping Dodo product IDs -> Murmur's internal tiers.
 * Read by: checkout route (3b.2), upgrade route (3b.3), CheckoutScreen (3b.4),
 * webhook handler (Phase 4).
 *
 * ⚠️  TEST MODE IDs. These product IDs were created in Dodo test mode.
 *     Before going live at GA, recreate the products in live mode and swap in
 *     the live `pdt_...` IDs here. A test ID in production will silently fail.
 *
 * ⚠️  IDEAS ARE OURS, NOT DODO'S. The `ideas` counts below are Murmur's own
 *     entitlement logic, written to `user_entitlements` (KAN-54) by the webhook
 *     handler. Do NOT use Dodo's "Credits" feature — it would fork the balance
 *     source of truth and cause drift / double-grants. Dodo only bills; we grant.
 *
 * ⚠️  INR IS A LOCALIZED PRICE, NOT A SEPARATE PRODUCT. Each subscription product
 *     carries a Dodo "By Country → India" price override. Tax mode is EXCLUSIVE:
 *     the `inrBase` below has 18% GST added on top at checkout, landing on the
 *     customer-facing charm total (`inrTotal`: ₹1,999 / ₹4,999 / ₹7,999). US
 *     prices are also exclusive ($19/$49/$79 + local tax on top). Dodo holds the
 *     authoritative override; `inrBase` here is reference only.
 *
 * ⚠️  DISPLAY `inrTotal`, NEVER `inrBase`. The charm total (₹1,999) is what the
 *     customer sees. `inrBase` (₹1,694.07) is the pre-GST figure entered in Dodo
 *     and must never be shown in UI copy.
 *
 * ⚠️  Dodo keys everything off the PRODUCT id — there are no separate price IDs.
 */

export interface DodoTier {
  productId: string;
  priceUSD: number;
  /** Monthly idea allowance — Murmur entitlement logic, written to user_entitlements. */
  ideas: number;
  /** Customer-facing INR charm total. GST is added on top of inrBase to reach this. DISPLAY THIS. */
  inrTotal: number;
  /** INR base entered in Dodo (exclusive); +18% GST => inrTotal. Reference only — NEVER display. */
  inrBase: number;
  /** Tier-priced one-time top-up (USD only; writes to purchased_balance). */
  topUp: { productId: string; priceUSD: number };
}

export const DODO_PRODUCTS = {
  starter: {
    productId: "pdt_0NnfXES5tgdKla8uS4e3E",
    priceUSD: 19,
    ideas: 5,
    inrTotal: 1999,
    inrBase: 1694.07,
    topUp: { productId: "pdt_0NnfbHEaNJNlst0ZuhXFN", priceUSD: 5 },
  },
  builder: {
    productId: "pdt_0NnfXmHr0vjFe3veehUuw",
    priceUSD: 49,
    ideas: 15,
    inrTotal: 4999,
    inrBase: 4236.44,
    topUp: { productId: "pdt_0NnfbJmMEtVY6ScC3SPHh", priceUSD: 4 },
  },
  studio: {
    productId: "pdt_0Nnfad43RPnGq4hq9mKKP",
    priceUSD: 79,
    ideas: 30,
    inrTotal: 7999,
    inrBase: 6778.81,
    topUp: { productId: "pdt_0NnfbMswS1JAlMNxxJ3BN", priceUSD: 3 },
  },
} as const satisfies Record<string, DodoTier>;

/** No-subscription, one-time idea purchase. Writes to purchased_balance (KAN-54). */
export const DODO_PAYG = {
  productId: "pdt_0NnfaztzQIZK4rmBnOVbx",
  priceUSD: 7,
} as const;

/** Reverse lookup: Dodo product id -> internal tier key. For webhook routing (Phase 4). */
export const PRODUCT_ID_TO_TIER: Record<
  string,
  keyof typeof DODO_PRODUCTS | "payg"
> = {
  [DODO_PRODUCTS.starter.productId]: "starter",
  [DODO_PRODUCTS.builder.productId]: "builder",
  [DODO_PRODUCTS.studio.productId]: "studio",
  [DODO_PAYG.productId]: "payg",
  // Top-ups resolve to their parent tier's purchased-balance grant:
  [DODO_PRODUCTS.starter.topUp.productId]: "starter",
  [DODO_PRODUCTS.builder.topUp.productId]: "builder",
  [DODO_PRODUCTS.studio.topUp.productId]: "studio",
};
