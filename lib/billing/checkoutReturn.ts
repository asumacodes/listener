export type CheckoutReturnIntent = "subscribe" | "topup" | "payg" | "upgrade";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Shared success landing for checkout sessions and hosted upgrade payment_link. */
export const billingSuccessUrl = (intent: CheckoutReturnIntent): string =>
  `${SITE_URL}/checkout/success?intent=${intent}`;

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
