import {
  PAID_CHECKOUT_TIERS,
  type PaidCheckoutTier,
} from "@/lib/billing/checkoutTier";
import {
  DODO_PRODUCTS,
  PRODUCT_ID_TO_TIER,
} from "@/lib/billing/dodo-products.config";
import { createShipAdminClient } from "@/lib/feedback-prompts/shipToken";
import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Minimal post-unwrap shape. Route verifies HMAC; this module never imports the SDK. */
export type DodoWebhookEvent = {
  type: string;
  data: {
    metadata?: Record<string, string> | null;
    product_id?: string;
    subscription_id?: string | null;
    product_cart?: { product_id: string; quantity: number }[] | null;
    cancel_at_next_billing_date?: boolean;
    next_billing_date?: string | null;
    status?: string;
  };
};

export type WebhookHandleResult = {
  action:
    | "grant"
    | "upgrade"
    | "buy"
    | "cancel"
    | "downgrade"
    | "skip"
    | "resume"
    | "noop";
  reason?: string;
};

type RpcOutcome = {
  ok: boolean;
  already_processed?: boolean;
  reason?: string;
};

export const parseWebhookUserId = (
  metadata: Record<string, string> | null | undefined
): string | null => {
  const raw = metadata?.user_id?.trim();
  if (!raw || !UUID_RE.test(raw)) return null;
  return raw;
};

export const paidTierFromSubscriptionProductId = (
  productId: string | undefined
): PaidCheckoutTier | null => {
  if (!productId) return null;
  for (const tier of PAID_CHECKOUT_TIERS) {
    if (DODO_PRODUCTS[tier].productId === productId) return tier;
  }
  return null;
};

export const isKnownBillingSku = (productId: string | undefined): boolean =>
  Boolean(productId && productId in PRODUCT_ID_TO_TIER);

const asRpcOutcome = (data: unknown): RpcOutcome => {
  if (!data || typeof data !== "object") return { ok: true };
  const row = data as Record<string, unknown>;
  return {
    ok: row.ok !== false,
    already_processed: Boolean(row.already_processed),
    reason: typeof row.reason === "string" ? row.reason : undefined,
  };
};

const callRpc = async (
  admin: SupabaseClient,
  fn: string,
  args: Record<string, unknown>
): Promise<RpcOutcome> => {
  const { data, error } = await admin.rpc(fn as never, args as never);
  if (error) throw error;
  return asRpcOutcome(data);
};

const userExists = async (
  admin: SupabaseClient,
  userId: string
): Promise<boolean> => {
  const { data, error } = await admin
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

const writeDodoSubscriptionId = async (
  admin: SupabaseClient,
  userId: string,
  subscriptionId: string
): Promise<void> => {
  const { error } = await admin
    .from("user_entitlements" as never)
    .update({ dodo_subscription_id: subscriptionId } as never)
    .eq("user_id", userId);
  if (error) throw error;
};

const peekSubscriptionEndsAt = async (
  admin: SupabaseClient,
  userId: string
): Promise<string | null> => {
  const { data, error } = await admin
    .from("user_entitlements" as never)
    .select("subscription_ends_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  const endsAt = (data as { subscription_ends_at?: string | null } | null)
    ?.subscription_ends_at;
  return endsAt ?? null;
};

const markScheduledCancel = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  endsAt: string
): Promise<WebhookHandleResult> => {
  const outcome = await callRpc(admin, "mark_cancellation", {
    p_user_id: userId,
    p_ends_at: endsAt,
    p_webhook_id: webhookId,
    p_event_type: eventType,
  });
  if (!outcome.ok) {
    return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
  }
  return { action: "cancel" };
};

const claimSkipGrant = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string
): Promise<void> => {
  const { error } = await admin.from("processed_webhooks" as never).upsert(
    {
      webhook_id: webhookId,
      event_type: eventType,
      user_id: userId,
    } as never,
    { onConflict: "webhook_id", ignoreDuplicates: true }
  );
  if (error) throw error;
};

const handleActive = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  data: DodoWebhookEvent["data"]
): Promise<WebhookHandleResult> => {
  const tier = paidTierFromSubscriptionProductId(data.product_id);
  if (!tier) {
    return { action: "noop", reason: "unknown_or_non_subscription_sku" };
  }
  const outcome = await callRpc(admin, "grant_subscription", {
    p_user_id: userId,
    p_tier: tier,
    p_webhook_id: webhookId,
    p_event_type: eventType,
  });
  if (!outcome.ok) {
    return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
  }
  const subId = data.subscription_id;
  if (subId) {
    await writeDodoSubscriptionId(admin, userId, subId);
  }
  return { action: "grant" };
};

const handleRenewed = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  data: DodoWebhookEvent["data"]
): Promise<WebhookHandleResult> => {
  if (data.cancel_at_next_billing_date) {
    if (!(await userExists(admin, userId))) {
      return { action: "noop", reason: "user_not_found" };
    }
    await claimSkipGrant(admin, webhookId, eventType, userId);
    return { action: "skip", reason: "pending_cancel" };
  }
  const tier = paidTierFromSubscriptionProductId(data.product_id);
  if (!tier) {
    return { action: "noop", reason: "unknown_or_non_subscription_sku" };
  }
  const outcome = await callRpc(admin, "grant_subscription", {
    p_user_id: userId,
    p_tier: tier,
    p_webhook_id: webhookId,
    p_event_type: eventType,
  });
  if (!outcome.ok) {
    return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
  }
  return { action: "grant" };
};

const handlePlanChanged = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  data: DodoWebhookEvent["data"]
): Promise<WebhookHandleResult> => {
  const tier = paidTierFromSubscriptionProductId(data.product_id);
  if (!tier) {
    return { action: "noop", reason: "unknown_or_non_subscription_sku" };
  }
  const outcome = await callRpc(admin, "apply_upgrade", {
    p_user_id: userId,
    p_new_tier: tier,
    p_webhook_id: webhookId,
    p_event_type: eventType,
  });
  if (!outcome.ok) {
    return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
  }
  return { action: "upgrade" };
};

const handlePaymentSucceeded = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  data: DodoWebhookEvent["data"]
): Promise<WebhookHandleResult> => {
  if (data.subscription_id) {
    return { action: "noop", reason: "subscription_charge" };
  }
  const line = data.product_cart?.[0];
  if (!line || !isKnownBillingSku(line.product_id)) {
    return { action: "noop", reason: "unknown_sku" };
  }
  const qty = line.quantity;
  if (!Number.isInteger(qty) || qty <= 0) {
    return { action: "noop", reason: "invalid_qty" };
  }
  const outcome = await callRpc(admin, "add_purchased", {
    p_user_id: userId,
    p_qty: qty,
    p_webhook_id: webhookId,
    p_event_type: eventType,
  });
  if (!outcome.ok) {
    return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
  }
  return { action: "buy" };
};

const handleCancelled = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  data: DodoWebhookEvent["data"]
): Promise<WebhookHandleResult> => {
  const status = data.status;
  if (status === "cancelled" || status === "expired") {
    return handleDowngrade(admin, webhookId, eventType, userId);
  }
  if (data.cancel_at_next_billing_date) {
    const endsAt = data.next_billing_date;
    if (!endsAt) {
      return { action: "noop", reason: "missing_next_billing_date" };
    }
    return markScheduledCancel(admin, webhookId, eventType, userId, endsAt);
  }
  return handleDowngrade(admin, webhookId, eventType, userId);
};

const handleUpdated = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string,
  data: DodoWebhookEvent["data"]
): Promise<WebhookHandleResult> => {
  if (data.cancel_at_next_billing_date === true) {
    const endsAt = data.next_billing_date;
    if (!endsAt) {
      return { action: "noop", reason: "missing_next_billing_date" };
    }
    return markScheduledCancel(admin, webhookId, eventType, userId, endsAt);
  }
  if (data.cancel_at_next_billing_date === false) {
    const endsAt = await peekSubscriptionEndsAt(admin, userId);
    if (!endsAt) {
      return { action: "noop", reason: "unrelated_update" };
    }
    const outcome = await callRpc(admin, "clear_cancellation", {
      p_user_id: userId,
      p_webhook_id: webhookId,
      p_event_type: eventType,
    });
    if (!outcome.ok) {
      return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
    }
    return { action: "resume" };
  }
  return { action: "noop", reason: "unrelated_update" };
};

const handleDowngrade = async (
  admin: SupabaseClient,
  webhookId: string,
  eventType: string,
  userId: string
): Promise<WebhookHandleResult> => {
  const outcome = await callRpc(admin, "downgrade_to_free", {
    p_user_id: userId,
    p_webhook_id: webhookId,
    p_event_type: eventType,
  });
  if (!outcome.ok) {
    return { action: "noop", reason: outcome.reason ?? "rpc_rejected" };
  }
  return { action: "downgrade" };
};

export const handleDodoWebhook = async (input: {
  webhookId: string;
  event: DodoWebhookEvent;
}): Promise<WebhookHandleResult> => {
  const userId = parseWebhookUserId(input.event.data.metadata ?? undefined);
  if (!userId) {
    return { action: "noop", reason: "missing_user_id" };
  }

  const { webhookId, event } = input;
  const type = event.type;
  const data = event.data;

  switch (type) {
    case "subscription.past_due":
      return { action: "noop", reason: "keep_access" };
    case "payment.failed":
    case "dunning.started":
    case "dunning.recovered":
      return { action: "noop", reason: "deferred" };
    case "subscription.active":
    case "subscription.renewed":
    case "subscription.plan_changed":
    case "payment.succeeded":
    case "subscription.cancelled":
    case "subscription.updated":
    case "subscription.on_hold":
    case "subscription.expired":
    case "subscription.failed":
      break;
    default:
      return { action: "noop", reason: "unhandled_type" };
  }

  const admin = createShipAdminClient();

  switch (type) {
    case "subscription.active":
      return handleActive(admin, webhookId, type, userId, data);
    case "subscription.renewed":
      return handleRenewed(admin, webhookId, type, userId, data);
    case "subscription.plan_changed":
      return handlePlanChanged(admin, webhookId, type, userId, data);
    case "payment.succeeded":
      return handlePaymentSucceeded(admin, webhookId, type, userId, data);
    case "subscription.cancelled":
      return handleCancelled(admin, webhookId, type, userId, data);
    case "subscription.updated":
      return handleUpdated(admin, webhookId, type, userId, data);
    case "subscription.on_hold":
    case "subscription.expired":
    case "subscription.failed":
      return handleDowngrade(admin, webhookId, type, userId);
    default:
      return { action: "noop", reason: "unhandled_type" };
  }
};
