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
