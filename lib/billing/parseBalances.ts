import type { BillingTier, EffectiveBalance } from "@/types/billing";

const BILLING_TIERS: ReadonlySet<string> = new Set<BillingTier>([
  "starter",
  "builder",
  "studio",
]);

const isBillingTier = (value: unknown): value is BillingTier =>
  typeof value === "string" && BILLING_TIERS.has(value);

const isTimestamp = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

/**
 * Strict validator for the get_effective_balance payload / 402 balances echo.
 * Lifted verbatim from lib/murmur/client.ts (KAN-82) so the 402 path and the
 * header display read through one parser and cannot drift.
 *
 * Three-way return: null = explicit empty, undefined = malformed, else parsed.
 */
export const parseBalances = (
  value: unknown
): EffectiveBalance | null | undefined => {
  if (value === null) return null;
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  if (typeof row.can_kickoff !== "boolean") return undefined;
  if (typeof row.bypass !== "boolean") return undefined;
  if (typeof row.free_grant_remaining !== "number") return undefined;
  if (typeof row.subscription_grant_remaining !== "number") return undefined;
  if (typeof row.purchased_balance !== "number") return undefined;
  const currentTier = row.current_tier;
  if (currentTier !== null && !isBillingTier(currentTier)) return undefined;
  const subscriptionResetAt = row.subscription_reset_at;
  const subscriptionEndsAt = row.subscription_ends_at;
  const foundingExpiresAt = row.founding_expires_at;
  if (!isTimestamp(subscriptionResetAt)) return undefined;
  if (!isTimestamp(subscriptionEndsAt)) return undefined;
  if (typeof row.founding_member !== "boolean") return undefined;
  if (!isTimestamp(foundingExpiresAt)) return undefined;
  return {
    can_kickoff: row.can_kickoff,
    bypass: row.bypass,
    free_grant_remaining: row.free_grant_remaining,
    subscription_grant_remaining: row.subscription_grant_remaining,
    purchased_balance: row.purchased_balance,
    current_tier: currentTier,
    subscription_reset_at: subscriptionResetAt,
    subscription_ends_at: subscriptionEndsAt,
    founding_member: row.founding_member,
    founding_expires_at: foundingExpiresAt,
  };
};
