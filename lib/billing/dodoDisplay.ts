import { DODO_PAYG, DODO_PRODUCTS } from "@/lib/billing/dodo-products.config";
import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";

export const formatUsd = (amount: number): string => `$${amount}`;

/** Customer-facing INR charm total. Never pass inrBase. */
export const formatInrTotal = (amount: number): string =>
  `₹${amount.toLocaleString("en-IN")}`;

export const formatSubscriptionPrice = (tier: PaidCheckoutTier): string => {
  const pack = DODO_PRODUCTS[tier];
  return `${formatUsd(pack.priceUSD)} · ${formatInrTotal(pack.inrTotal)}`;
};

export const formatTopUpPrice = (tier: PaidCheckoutTier): string =>
  formatUsd(DODO_PRODUCTS[tier].topUp.priceUSD);

export const formatPaygPrice = (): string => formatUsd(DODO_PAYG.priceUSD);
