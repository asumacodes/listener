/**
 * Post-checkout expectation (KAN-85 Phase 3b).
 *
 * Written on "Continue to checkout", read when the studio next loads. It says
 * what the user *asked* for — never that a grant landed. Nothing here is ever
 * rendered as a number; only `get_effective_balance` is allowed to say that.
 *
 * Scoped per user id so a shared device can't hand one account another's
 * welcome, and dropped after a day so a checkout that was abandoned (or
 * completed on another device) stops haunting this one.
 */

import { getSessionUser } from "@/lib/auth/session";
import {
  parsePaidCheckoutTier,
  type PaidCheckoutTier,
} from "@/lib/billing/checkoutTier";
import type { BillingTier } from "@/types/billing";

export type CheckoutPendingAction = "subscribe" | "upgrade";

export type CheckoutPending = {
  action: CheckoutPendingAction;
  tier: PaidCheckoutTier;
  /** Tier held when checkout started — present only for an upgrade. */
  from_tier: BillingTier | null;
  ts: number;
};

export const CHECKOUT_PENDING_TTL_MS = 24 * 60 * 60 * 1000;

const keyFor = (userId: string) => `listener:checkout-pending:${userId}`;

const parsePending = (raw: string): CheckoutPending | null => {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const tier = parsePaidCheckoutTier(
    typeof row.tier === "string" ? row.tier : null
  );
  if (!tier) return null;
  if (row.action !== "subscribe" && row.action !== "upgrade") return null;
  const fromTier = parsePaidCheckoutTier(
    typeof row.from_tier === "string" ? row.from_tier : null
  );
  const ts = typeof row.ts === "number" && Number.isFinite(row.ts) ? row.ts : 0;
  return { action: row.action, tier, from_tier: fromTier, ts };
};

/** Fail-open: unreadable storage means no pending checkout, never a fake one. */
export const readCheckoutPending = (
  userId: string,
  now: number = Date.now()
): CheckoutPending | null => {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(keyFor(userId));
  } catch {
    return null;
  }
  if (!raw) return null;
  const pending = parsePending(raw);
  if (!pending) {
    clearCheckoutPending(userId);
    return null;
  }
  // Stale pending is dropped silently — another device just sees the balance.
  if (now - pending.ts > CHECKOUT_PENDING_TTL_MS) {
    clearCheckoutPending(userId);
    return null;
  }
  return pending;
};

export const writeCheckoutPending = (
  userId: string,
  pending: CheckoutPending
): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(pending));
  } catch {
    // Fail-open: no welcome is better than blocking the handoff to Dodo.
  }
};

export const clearCheckoutPending = (userId: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(keyFor(userId));
  } catch {
    // Fail-open: the planWelcomed stamp still keeps the welcome to once.
  }
};

/**
 * Called on the way out to Dodo. Resolves the session user itself so callers
 * don't have to hold one, and never throws — a missing session just means no
 * welcome on return.
 */
export const rememberCheckoutPending = async ({
  action,
  tier,
  fromTier,
}: {
  action: CheckoutPendingAction;
  tier: PaidCheckoutTier;
  fromTier: BillingTier | null;
}): Promise<void> => {
  const user = await getSessionUser().catch(() => null);
  if (!user?.id) return;
  writeCheckoutPending(user.id, {
    action,
    tier,
    from_tier: action === "upgrade" ? fromTier : null,
    ts: Date.now(),
  });
};
