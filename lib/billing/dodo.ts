import DodoPayments from "dodopayments";

/**
 * Server-only Dodo client. Checkout UI must import dodo-products.config.ts,
 * never this module (the SDK must not ship to the client).
 *
 * Env: DODO_API_KEY, DODO_WEBHOOK_SECRET (passed at webhooks.unwrap, not
 * on this client), DODO_ENV = test_mode | live_mode (default test_mode).
 * Flipping DODO_ENV to live_mode is the GA switch and requires swapping
 * test product IDs in the config. Also turn on the live merchant's
 * Settings → Subscriptions → Collect Plan Change Payments by Payment
 * Link (allow_plan_change_via_payment_link) or changePlan with
 * collect_via_payment_link: true 422s the same way test did.
 */
export const createDodoClient = () => {
  const key = process.env.DODO_API_KEY;
  if (!key) {
    throw new Error("Dodo is not configured");
  }
  const environment =
    process.env.DODO_ENV === "live_mode" ? "live_mode" : "test_mode";
  return new DodoPayments({
    bearerToken: key,
    environment,
  });
};

export {
  DODO_PAYG,
  DODO_PRODUCTS,
  PRODUCT_ID_TO_TIER,
} from "@/lib/billing/dodo-products.config";
export type { DodoTier } from "@/lib/billing/dodo-products.config";
