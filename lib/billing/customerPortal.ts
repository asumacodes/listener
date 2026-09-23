/**
 * Dodo customer portal — payment method and receipts only.
 * Plan changes stay in our UI. The portal is the one place a customer can
 * replace a card Dodo holds.
 */

import { createDodoClient } from "@/lib/billing/dodo";
import { readDodoSubscriptionId } from "@/lib/billing/dodoSubscriptionId";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type PortalLinkResult =
  | { ok: true; portal_url: string }
  | {
      ok: false;
      reason: "customer_not_found" | "dodo_not_configured" | "portal_failed";
      detail?: string;
    };

const metadataUserId = (metadata: unknown): string | null => {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>).user_id;
  return typeof value === "string" && value.length > 0 ? value : null;
};

const customerIdFromSubscription = async (
  dodo: ReturnType<typeof createDodoClient>,
  userId: string
): Promise<string | null> => {
  const subId = await readDodoSubscriptionId(userId);
  if (!subId) return null;
  const subscription = await dodo.subscriptions.retrieve(subId);
  const customerId = subscription.customer?.customer_id;
  return typeof customerId === "string" && customerId.length > 0
    ? customerId
    : null;
};

const customerIdFromEmail = async (
  dodo: ReturnType<typeof createDodoClient>,
  userId: string,
  email: string
): Promise<string | null> => {
  const page = await dodo.customers.list({ email });
  const owned = page.items.find(
    (item) => metadataUserId(item.metadata) === userId
  );
  if (owned) return owned.customer_id;
  if (page.items.length === 1) return page.items[0]?.customer_id ?? null;
  return null;
};

export const createCustomerPortalLink = async (user: {
  id: string;
  email?: string | null;
}): Promise<PortalLinkResult> => {
  let dodo;
  try {
    dodo = createDodoClient();
  } catch {
    return { ok: false, reason: "dodo_not_configured" };
  }

  try {
    let fromSubscription: string | null = null;
    try {
      fromSubscription = await customerIdFromSubscription(dodo, user.id);
    } catch {
      fromSubscription = null;
    }
    const email = user.email?.trim();
    const customerId =
      fromSubscription ??
      (email ? await customerIdFromEmail(dodo, user.id, email) : null);
    if (!customerId) return { ok: false, reason: "customer_not_found" };

    const session = await dodo.customers.customerPortal.create(customerId, {
      return_url: `${SITE_URL}/account/plan`,
      send_email: false,
    });
    if (!session.link) return { ok: false, reason: "portal_failed" };
    return { ok: true, portal_url: session.link };
  } catch (e) {
    return { ok: false, reason: "portal_failed", detail: String(e) };
  }
};
