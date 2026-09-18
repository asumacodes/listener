import type { PaidCheckoutTier } from "@/lib/billing/checkoutTier";

export type CheckoutIntent = "subscribe" | "topup" | "payg";

export type CheckoutSessionRequest = {
  intent: CheckoutIntent;
  tier?: PaidCheckoutTier;
};

export type CheckoutSessionOk = { ok: true; checkout_url: string };

export type CheckoutSessionErr = {
  ok: false;
  reason: string;
  detail?: string;
};

const parseJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const createBillingCheckout = async (
  body: CheckoutSessionRequest
): Promise<CheckoutSessionOk | CheckoutSessionErr> => {
  let res: Response;
  try {
    res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, reason: "unreachable", detail: String(e) };
  }

  const json = (await parseJson(res)) as Record<string, unknown> | null;
  if (typeof json?.checkout_url === "string" && json.checkout_url.length > 0) {
    return { ok: true, checkout_url: json.checkout_url };
  }
  return {
    ok: false,
    reason: typeof json?.reason === "string" ? json.reason : "checkout_failed",
    detail: typeof json?.detail === "string" ? json.detail : undefined,
  };
};

export const changeBillingPlan = async (
  newTier: PaidCheckoutTier
): Promise<{ ok: true; payment_link: string } | CheckoutSessionErr> => {
  let res: Response;
  try {
    res = await fetch("/api/billing/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_tier: newTier }),
    });
  } catch (e) {
    return { ok: false, reason: "unreachable", detail: String(e) };
  }

  const json = (await parseJson(res)) as Record<string, unknown> | null;
  if (typeof json?.payment_link === "string" && json.payment_link.length > 0) {
    return { ok: true, payment_link: json.payment_link };
  }
  return {
    ok: false,
    reason: typeof json?.reason === "string" ? json.reason : "upgrade_failed",
    detail: typeof json?.detail === "string" ? json.detail : undefined,
  };
};

export const updateBillingSubscription = async (
  cancelAtNextBillingDate: boolean
): Promise<{ ok: true } | CheckoutSessionErr> => {
  let res: Response;
  try {
    res = await fetch("/api/billing/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cancel_at_next_billing_date: cancelAtNextBillingDate,
      }),
    });
  } catch (e) {
    return { ok: false, reason: "unreachable", detail: String(e) };
  }

  if (res.ok) return { ok: true };
  const json = (await parseJson(res)) as Record<string, unknown> | null;
  return {
    ok: false,
    reason:
      typeof json?.reason === "string"
        ? json.reason
        : "subscription_update_failed",
    detail: typeof json?.detail === "string" ? json.detail : undefined,
  };
};
