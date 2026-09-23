import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";

export type CheckoutReturnIntent = "subscribe" | "topup" | "payg" | "upgrade";

/**
 * What the return screen says happened. Pay-as-you-go and a tier top-up land on
 * the same story — extra ideas were added — so both collapse to `topup`.
 */
export const RETURN_ACTIONS = ["subscribe", "topup", "upgrade"] as const;

export type CheckoutReturnAction = (typeof RETURN_ACTIONS)[number];

const RETURN_SET: ReadonlySet<string> = new Set(RETURN_ACTIONS);

export const returnActionForIntent = (
  intent: CheckoutReturnIntent
): CheckoutReturnAction => (intent === "payg" ? "topup" : intent);

export const parseReturnAction = (
  raw: string | null | undefined
): CheckoutReturnAction | null => {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  if (RETURN_SET.has(slug)) return slug as CheckoutReturnAction;
  // Legacy /checkout/success?intent=payg links still in flight.
  if (slug === "payg") return "topup";
  return null;
};

/**
 * Dodo appends `status` to every return redirect — including failures. It is a
 * veto only: a failure status blocks the success story; a success status proves
 * nothing (only a balance read past the baseline does).
 */
const PROVIDER_FAILED: ReadonlySet<string> = new Set([
  "failed",
  "cancelled",
  "canceled",
  "expired",
  "on_hold",
]);

export const isProviderFailure = (raw: string | null | undefined): boolean =>
  Boolean(raw) && PROVIDER_FAILED.has(raw!.trim().toLowerCase());

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Shared landing for checkout sessions and hosted upgrade payment_link.
 * `action` and `tier` are copy hints only — the balance still arrives by
 * webhook, and the screen shows a processing beat until it does.
 */
export const billingSuccessUrl = (
  intent: CheckoutReturnIntent,
  tier?: PaidCheckoutTier
): string => {
  const action = returnActionForIntent(intent);
  const suffix = tier ? `&tier=${tier}` : "";
  return `${SITE_URL}/checkout/return?action=${action}${suffix}`;
};

/**
 * Dodo changePlan has no return_url. Hosted checkout reads redirect_url
 * on the payment_link the same way static buy links do.
 */
export const withHostedCheckoutReturn = (
  paymentLink: string,
  returnUrl: string
): string => {
  const url = new URL(paymentLink);
  url.searchParams.set("redirect_url", returnUrl);
  return url.toString();
};
