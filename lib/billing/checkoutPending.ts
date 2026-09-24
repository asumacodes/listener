/**
 * Post-checkout expectation (KAN-85 Phase 3b).
 *
 * Written on the way out to Dodo, read by the return screen and the studio. It
 * says what the user *asked* for, plus a snapshot of the balance as it stood
 * before paying — never that a grant landed. Only a `get_effective_balance`
 * read that has moved past that baseline (see grantConfirmed.ts) may say that.
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
import { getBalanceForDisplay } from "@/lib/billing/displayBalance";
import type { BillingTier } from "@/types/billing";

export type CheckoutPendingAction = "subscribe" | "upgrade" | "topup";

/** The balance fields a grant moves, captured just before the Dodo handoff. */
export type CheckoutBaseline = {
  current_tier: BillingTier | null;
  subscription_reset_at: string | null;
  purchased_balance: number;
  /**
   * Founding status before paying — analytics only (founding_slot_claimed needs
   * proof of the false → true transition). Absent on older markers.
   */
  founding_member?: boolean;
};

export type CheckoutPending = {
  action: CheckoutPendingAction;
  /** Tier bought or upgraded to. Null only for a pay-as-you-go top-up. */
  tier: PaidCheckoutTier | null;
  /** Tier held when checkout started — present only for an upgrade. */
  from_tier: BillingTier | null;
  /**
   * Null when the pre-checkout read failed, or on a marker written before
   * baselines existed. A null baseline is never confirmable.
   */
  baseline: CheckoutBaseline | null;
  ts: number;
};

export const CHECKOUT_PENDING_TTL_MS = 24 * 60 * 60 * 1000;

const keyFor = (userId: string) => `listener:checkout-pending:${userId}`;

const parseBaseline = (value: unknown): CheckoutBaseline | null => {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const tier =
    row.current_tier === null
      ? null
      : parsePaidCheckoutTier(
          typeof row.current_tier === "string" ? row.current_tier : null
        );
  if (row.current_tier !== null && tier === null) return null;
  const resetAt = row.subscription_reset_at;
  if (resetAt !== null && typeof resetAt !== "string") return null;
  const purchased = row.purchased_balance;
  if (typeof purchased !== "number" || !Number.isFinite(purchased)) return null;
  return {
    current_tier: tier,
    subscription_reset_at: resetAt,
    purchased_balance: purchased,
    ...(typeof row.founding_member === "boolean"
      ? { founding_member: row.founding_member }
      : {}),
  };
};

const parsePending = (raw: string): CheckoutPending | null => {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const action = row.action;
  if (action !== "subscribe" && action !== "upgrade" && action !== "topup") {
    return null;
  }
  const tier = parsePaidCheckoutTier(
    typeof row.tier === "string" ? row.tier : null
  );
  // Plan changes must name the tier they expect; a top-up may be pay-as-you-go.
  if (!tier && action !== "topup") return null;
  const fromTier = parsePaidCheckoutTier(
    typeof row.from_tier === "string" ? row.from_tier : null
  );
  const ts = typeof row.ts === "number" && Number.isFinite(row.ts) ? row.ts : 0;
  return {
    action,
    tier,
    from_tier: fromTier,
    baseline: parseBaseline(row.baseline),
    ts,
  };
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
 * Called on the way out to Dodo, after the checkout session exists. Resolves
 * the session user and a fresh balance itself, and never throws — a missing
 * session means no marker; a failed balance read means a baseline-less marker,
 * which can never confirm (the return screen times out to a neutral state).
 */
export const rememberCheckoutPending = async ({
  action,
  tier,
}: {
  action: CheckoutPendingAction;
  tier: PaidCheckoutTier | null;
}): Promise<void> => {
  const user = await getSessionUser().catch(() => null);
  if (!user?.id) return;
  const balance = await getBalanceForDisplay().catch(() => null);
  const baseline: CheckoutBaseline | null = balance
    ? {
        current_tier: balance.current_tier,
        subscription_reset_at: balance.subscription_reset_at,
        purchased_balance: balance.purchased_balance,
        founding_member: balance.founding_member,
      }
    : null;
  writeCheckoutPending(user.id, {
    action,
    tier,
    from_tier: action === "upgrade" ? (baseline?.current_tier ?? null) : null,
    baseline,
    ts: Date.now(),
  });
};
