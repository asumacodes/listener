-- KAN-85 Phase 4: Dodo subscription id on user_entitlements.
-- Written from subscription.active (overwrite on re-subscribe). Unblocks
-- POST /api/billing/upgrade which 501s until this column is populated.

ALTER TABLE public.user_entitlements
  ADD COLUMN IF NOT EXISTS dodo_subscription_id text;

COMMENT ON COLUMN public.user_entitlements.dodo_subscription_id IS
  'KAN-85: Dodo subscription id from subscription.active. Overwritten on re-subscribe. NULL = never subscribed via Dodo.';
