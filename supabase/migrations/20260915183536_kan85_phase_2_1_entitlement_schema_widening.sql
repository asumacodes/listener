-- KAN-85 Phase 2.1 (hardened): entitlement schema widening. Additive only.

-- 1. New columns on user_entitlements
ALTER TABLE public.user_entitlements
  ADD COLUMN IF NOT EXISTS subscription_reset_at  timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_ends_at   timestamptz,
  ADD COLUMN IF NOT EXISTS current_tier           text,
  ADD COLUMN IF NOT EXISTS founding_member        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS founding_expires_at    timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conname = 'current_tier_valid' AND conrelid = 'public.user_entitlements'::regclass) THEN
    ALTER TABLE public.user_entitlements
      ADD CONSTRAINT current_tier_valid
      CHECK (current_tier IS NULL OR current_tier IN ('starter','builder','studio'));
  END IF;
  -- founding invariant: member iff expiry is set (no half-set rows)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conname = 'founding_consistent' AND conrelid = 'public.user_entitlements'::regclass) THEN
    ALTER TABLE public.user_entitlements
      ADD CONSTRAINT founding_consistent
      CHECK (founding_member = (founding_expires_at IS NOT NULL));
  END IF;
END $$;

COMMENT ON COLUMN public.user_entitlements.subscription_reset_at IS
  'KAN-85: when the current subscription bucket next refills. NULL = no active subscription.';
COMMENT ON COLUMN public.user_entitlements.subscription_ends_at IS
  'KAN-85: set on cancellation — ideas usable until this instant, then downgrade_to_free. NULL = not cancelled.';
COMMENT ON COLUMN public.user_entitlements.current_tier IS
  'KAN-85: active tier so renewal knows the base to set. NULL = free/none.';
COMMENT ON COLUMN public.user_entitlements.founding_member IS
  'KAN-85: true if within first 50 subscribers. 2x subscription grant until founding_expires_at.';
COMMENT ON COLUMN public.user_entitlements.founding_expires_at IS
  'KAN-85: instant the 2x founding bonus ends (12mo from first subscribe). NULL = not founding.';

-- 2. Webhook idempotency ledger
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  webhook_id    text        NOT NULL,
  event_type    text        NOT NULL,
  user_id       uuid,
  processed_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT processed_webhooks_pkey PRIMARY KEY (webhook_id)
);

COMMENT ON TABLE public.processed_webhooks IS
  'KAN-85 idempotency ledger: one row per handled Dodo webhook-id. PK makes replay a structural no-op (same pattern as entitlement_debits.root_run_id). Rows retained past user deletion (user_id SET NULL) for financial audit. Service-role only; RLS default-deny.';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conname = 'processed_webhooks_user_id_fkey' AND conrelid = 'public.processed_webhooks'::regclass) THEN
    ALTER TABLE public.processed_webhooks
      ADD CONSTRAINT processed_webhooks_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.processed_webhooks FROM anon, authenticated;
GRANT ALL ON TABLE public.processed_webhooks TO service_role;

-- 3. Race-safe founding counter
CREATE TABLE IF NOT EXISTS public.founding_counter (
  id        boolean NOT NULL DEFAULT true,
  claimed   integer NOT NULL DEFAULT 0,
  cap       integer NOT NULL DEFAULT 50,
  CONSTRAINT founding_counter_pkey PRIMARY KEY (id),
  CONSTRAINT founding_counter_singleton CHECK (id = true),
  CONSTRAINT founding_claimed_non_negative CHECK (claimed >= 0),
  CONSTRAINT founding_claimed_within_cap CHECK (claimed <= cap)
);

COMMENT ON TABLE public.founding_counter IS
  'KAN-85: single-row counter for first-50 founding cohort. grant_subscription does SELECT ... FOR UPDATE + increment. Service-role only; RLS default-deny.';

INSERT INTO public.founding_counter (id, claimed, cap) VALUES (true, 0, 50)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.founding_counter ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.founding_counter FROM anon, authenticated;
GRANT ALL ON TABLE public.founding_counter TO service_role;
