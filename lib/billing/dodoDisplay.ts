import { DODO_PAYG, DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";
import type { DisplayCurrency } from "@/lib/billing/currency";

export const formatUsd = (amount: number): string => `$${amount}`;

/** Customer-facing INR charm total. Never pass inrBase. */
export const formatInrTotal = (amount: number): string =>
  `₹${amount.toLocaleString("en-IN")}`;

/**
 * One currency per viewer: `inrTotal` (the GST-inclusive charm price, never
 * `inrBase`) for INR, `priceUSD` otherwise. Display only — Dodo charges its
 * own localized amount regardless of what this returns.
 */
export const formatSubscriptionPrice = (
  tier: PaidCheckoutTier,
  currency: DisplayCurrency
): string => {
  const pack = DODO_PRODUCTS[tier];
  return currency === "INR"
    ? formatInrTotal(pack.inrTotal)
    : formatUsd(pack.priceUSD);
};

/**
 * Top-ups and pay-as-you-go are USD-only by product decision (no INR price in
 * dodo-products.config), so they show USD for every viewer. `currency` is
 * accepted for a uniform call shape; Dodo still localizes the actual charge.
 */
export const formatTopUpPrice = (
  tier: PaidCheckoutTier,
  currency: DisplayCurrency
): string => {
  void currency;
  return formatUsd(DODO_PRODUCTS[tier].topUp.priceUSD);
};

export const formatPaygPrice = (currency: DisplayCurrency): string => {
  void currency;
  return formatUsd(DODO_PAYG.priceUSD);
};
