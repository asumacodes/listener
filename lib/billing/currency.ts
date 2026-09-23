/**
 * In-app price DISPLAY currency (display only).
 *
 * Chooses which price string the UI shows before the Dodo redirect — nothing
 * else. It is never sent to /api/billing/*, never picks a product, and never
 * changes what is charged: Dodo's hosted checkout localizes the actual charge
 * from the customer's card/location on its own. An unknown-geo Indian user who
 * sees $ here is still charged ₹ by Dodo, so the USD fallback self-corrects.
 *
 * Only two currencies exist, so this is a binary rule, not a resolver.
 * Pure — no I/O; the country comes from lib/billing/currency.server.ts.
 */

export type DisplayCurrency = "INR" | "USD";

/** India → INR; everything else, including unknown/missing geo → USD. */
export const currencyForCountry = (
  country: string | null | undefined
): DisplayCurrency => (country?.trim().toUpperCase() === "IN" ? "INR" : "USD");
