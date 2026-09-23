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

/** RPC json may emit counts as numbers or numeric strings. Missing/NaN stays malformed. */
const asFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

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
  const freeGrantRemaining = asFiniteNumber(row.free_grant_remaining);
  const subscriptionGrantRemaining = asFiniteNumber(
    row.subscription_grant_remaining
  );
  const purchasedBalance = asFiniteNumber(row.purchased_balance);
  if (freeGrantRemaining === undefined) return undefined;
  if (subscriptionGrantRemaining === undefined) return undefined;
  if (purchasedBalance === undefined) return undefined;
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
    free_grant_remaining: freeGrantRemaining,
    subscription_grant_remaining: subscriptionGrantRemaining,
    purchased_balance: purchasedBalance,
    current_tier: currentTier,
    subscription_reset_at: subscriptionResetAt,
    subscription_ends_at: subscriptionEndsAt,
    founding_member: row.founding_member,
    founding_expires_at: foundingExpiresAt,
  };
};
