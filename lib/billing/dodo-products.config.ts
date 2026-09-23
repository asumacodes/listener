/**
 * Dodo Payments — product config map (KAN-85, Phase 1)
 * =====================================================
 *
 * Single source of truth mapping Dodo product IDs -> Murmur's internal tiers.
 * Read by: checkout route (3b.2), upgrade route (3b.3), CheckoutScreen (3b.4),
 * webhook handler (Phase 4).
 *
 * ⚠️  TWO CATALOGS, ONE ACTIVE. Test and live product IDs both live here.
 *     The active set follows DODO_ENV: live_mode uses the live merchant IDs,
 *     anything else (including unset) uses test. Prod must set DODO_ENV=live_mode
 *     — same switch as createDodoClient. A test ID against the live API fails
 *     silently. On the live merchant, Settings → Subscriptions → Collect
 *     Plan Change Payments by Payment Link must be ON, or upgrade 422s.
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

import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";

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

type DodoEnv = "test_mode" | "live_mode";

/** Matches createDodoClient: only the literal live_mode leaves test. */
export const dodoEnv = (): DodoEnv =>
  process.env.DODO_ENV === "live_mode" ? "live_mode" : "test_mode";

/** Shared prices and idea counts. Product IDs are the only env-specific field. */
const TIER_PRICES = {
  starter: {
    priceUSD: 19,
    ideas: 5,
    inrTotal: 1999,
    inrBase: 1694.07,
    topUpUSD: 5,
  },
  builder: {
    priceUSD: 49,
    ideas: 15,
    inrTotal: 4999,
    inrBase: 4236.44,
    topUpUSD: 4,
  },
  studio: {
    priceUSD: 79,
    ideas: 30,
    inrTotal: 7999,
    inrBase: 6778.81,
    topUpUSD: 3,
  },
} as const satisfies Record<
  PaidCheckoutTier,
  {
    priceUSD: number;
    ideas: number;
    inrTotal: number;
    inrBase: number;
    topUpUSD: number;
  }
>;

const PAYG_PRICE_USD = 7;

type ProductIds = Record<
  PaidCheckoutTier,
  { productId: string; topUpId: string }
> & { payg: string };

const PRODUCT_IDS: Record<DodoEnv, ProductIds> = {
  test_mode: {
    starter: {
      productId: "pdt_0NnfXES5tgdKla8uS4e3E",
      topUpId: "pdt_0NnfbHEaNJNlst0ZuhXFN",
    },
    builder: {
      productId: "pdt_0NnfXmHr0vjFe3veehUuw",
      topUpId: "pdt_0NnfbJmMEtVY6ScC3SPHh",
    },
    studio: {
      productId: "pdt_0Nnfad43RPnGq4hq9mKKP",
      topUpId: "pdt_0NnfbMswS1JAlMNxxJ3BN",
    },
    payg: "pdt_0NnfaztzQIZK4rmBnOVbx",
  },
  live_mode: {
    starter: {
      productId: "pdt_0NoAVu64qN0NrL8AcWPgD",
      topUpId: "pdt_0NoAVtsNfuDYRFtOll3Ra",
    },
    builder: {
      productId: "pdt_0NoAVu2a0gcz5LbcuDTnJ",
      topUpId: "pdt_0NoAVtp2fKyvD3q6UMFpx",
    },
    studio: {
      productId: "pdt_0NoAVtyoZ02SeaPHekxNC",
      topUpId: "pdt_0NoAVtlNHAyRXFxDJSyR3",
    },
    payg: "pdt_0NoAVtvXL5Mbap9KEU3Y5",
  },
};

const catalogFor = (
  env: DodoEnv
): {
  products: Record<PaidCheckoutTier, DodoTier>;
  payg: { productId: string; priceUSD: number };
} => {
  const ids = PRODUCT_IDS[env];
  const products = {} as Record<PaidCheckoutTier, DodoTier>;
  for (const tier of ["starter", "builder", "studio"] as const) {
    const price = TIER_PRICES[tier];
    products[tier] = {
      productId: ids[tier].productId,
      priceUSD: price.priceUSD,
      ideas: price.ideas,
      inrTotal: price.inrTotal,
      inrBase: price.inrBase,
      topUp: { productId: ids[tier].topUpId, priceUSD: price.topUpUSD },
    };
  }
  return {
    products,
    payg: { productId: ids.payg, priceUSD: PAYG_PRICE_USD },
  };
};

const active = catalogFor(dodoEnv());

export const DODO_PRODUCTS = active.products;

/** No-subscription, one-time idea purchase. Writes to purchased_balance (KAN-54). */
export const DODO_PAYG = active.payg;

/** Reverse lookup: active-catalog product id -> internal tier key. For webhook routing. */
export const PRODUCT_ID_TO_TIER: Record<string, PaidCheckoutTier | "payg"> = {
  [DODO_PRODUCTS.starter.productId]: "starter",
  [DODO_PRODUCTS.builder.productId]: "builder",
  [DODO_PRODUCTS.studio.productId]: "studio",
  [DODO_PAYG.productId]: "payg",
  [DODO_PRODUCTS.starter.topUp.productId]: "starter",
  [DODO_PRODUCTS.builder.topUp.productId]: "builder",
  [DODO_PRODUCTS.studio.topUp.productId]: "studio",
};
