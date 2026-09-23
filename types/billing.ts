/**
 * Shape returned by public.get_effective_balance() (KAN-54, widened KAN-85).
 * Echoed on 402 out_of_quota so the client can render without a second round-trip.
 */
export type BillingTier = "starter" | "builder" | "studio";

export type EffectiveBalance = {
  can_kickoff: boolean;
  bypass: boolean;
  free_grant_remaining: number;
  subscription_grant_remaining: number;
  purchased_balance: number;
  current_tier: BillingTier | null;
  subscription_reset_at: string | null;
  subscription_ends_at: string | null;
  founding_member: boolean;
  founding_expires_at: string | null;
};

/**
 * Display-facing view of the entitlement balance (KAN-82 / KAN-85).
 * `effectiveRemaining` is free + subscription grant + purchased (usable total).
 * The Plan purchased line is `purchased_balance` alone — a subset, not a second total.
 * Reset / founding / tier fields feed the Profile breakdown (Phase 6).
 */
export type BalanceDisplay = EffectiveBalance & {
  effectiveRemaining: number;
};
