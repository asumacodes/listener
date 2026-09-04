/**
 * Shape returned by public.get_effective_balance() (KAN-54).
 * Echoed on 402 out_of_quota so the client can render without a second round-trip.
 */
export type EffectiveBalance = {
  can_kickoff: boolean;
  bypass: boolean;
  free_grant_remaining: number;
  subscription_grant_remaining: number;
  purchased_balance: number;
};

/**
 * Display-facing view of the entitlement balance (KAN-82).
 * `effectiveRemaining` is the client-side sum used by the header pill.
 * No reset/founding-expiry fields — those await KAN-65's RPC widening (Option B).
 */
export type BalanceDisplay = EffectiveBalance & {
  effectiveRemaining: number;
};
