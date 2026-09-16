-- KAN-85 Phase 2.3: service-role write RPCs for Dodo subscription/purchased
-- grants. Insert-then-act on processed_webhooks (same structure as
-- entitlement_debits PK-on-root). consume_entitlement_for_run is untouched.
-- Validation failures return json and do NOT claim the webhook-id, so a
-- retried delivery with a fixed payload can still act. Unexpected failures
-- RAISE and roll back the claim.

-- ---------------------------------------------------------------------------
-- Internal: monthly idea base per tier (Starter 5 / Builder 15 / Studio 30).
-- Not granted to clients; write RPCs are owner-DEFINER and call it directly.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.entitlement_tier_base(p_tier text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path TO 'public'
AS $$
  SELECT CASE p_tier
    WHEN 'starter' THEN 5
    WHEN 'builder' THEN 15
    WHEN 'studio' THEN 30
    ELSE NULL
  END;
$$;

COMMENT ON FUNCTION public.entitlement_tier_base(text) IS
  'KAN-85: monthly idea grant for a paid tier. NULL if p_tier is not starter/builder/studio.';

REVOKE ALL ON FUNCTION public.entitlement_tier_base(text) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Internal: claim a Dodo webhook-id. true = first insert (caller must act);
-- false = replay (caller must no-op). Not granted to clients.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_processed_webhook(
  p_webhook_id text,
  p_event_type text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare
  v_rowcount integer;
begin
  insert into public.processed_webhooks (webhook_id, event_type, user_id)
  values (p_webhook_id, p_event_type, p_user_id)
  on conflict (webhook_id) do nothing;
  get diagnostics v_rowcount = row_count;
  return v_rowcount = 1;
end;
$$;

COMMENT ON FUNCTION public.claim_processed_webhook(text, text, uuid) IS
  'KAN-85: insert-then-act helper for processed_webhooks. true = claimed, false = replay.';

REVOKE ALL ON FUNCTION public.claim_processed_webhook(text, text, uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- grant_subscription: new sub / renewal. SET (not add) the monthly bucket.
-- Claims founding on first paid subscribe via founding_counter FOR UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_subscription(
  p_user_id uuid,
  p_tier text,
  p_webhook_id text,
  p_event_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_base integer;
  v_ent public.user_entitlements%rowtype;
  v_claimed integer;
  v_cap integer;
  v_founding_member boolean;
  v_founding_expires_at timestamptz;
  v_doubled boolean;
  v_grant integer;
begin
  if p_webhook_id is null or btrim(p_webhook_id) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_webhook_id');
  end if;
  if p_event_type is null or btrim(p_event_type) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_event_type');
  end if;
  if p_user_id is null then
    return json_build_object('ok', false, 'reason', 'invalid_user_id');
  end if;

  v_base := public.entitlement_tier_base(p_tier);
  if v_base is null then
    return json_build_object('ok', false, 'reason', 'invalid_tier');
  end if;

  if not exists (select 1 from public.users u where u.id = p_user_id) then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;

  insert into public.user_entitlements (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  if not public.claim_processed_webhook(p_webhook_id, p_event_type, p_user_id) then
    return json_build_object('ok', true, 'already_processed', true);
  end if;

  select * into v_ent
  from public.user_entitlements
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'grant_subscription: entitlement row missing for %', p_user_id;
  end if;

  v_founding_member := v_ent.founding_member;
  v_founding_expires_at := v_ent.founding_expires_at;

  -- First paid subscribe only. Renewals and already-founding users skip the counter.
  if not v_ent.founding_member then
    select claimed, cap into v_claimed, v_cap
    from public.founding_counter
    where id = true
    for update;

    if not found then
      raise exception 'grant_subscription: founding_counter row missing';
    end if;

    if v_claimed < v_cap then
      update public.founding_counter
      set claimed = claimed + 1
      where id = true;
      v_founding_member := true;
      v_founding_expires_at := now() + interval '12 months';
    end if;
  end if;

  v_doubled := v_founding_member
    and v_founding_expires_at is not null
    and v_founding_expires_at > now();
  v_grant := case when v_doubled then v_base * 2 else v_base end;

  update public.user_entitlements
  set
    subscription_grant_remaining = v_grant,
    current_tier = p_tier,
    subscription_reset_at = now() + interval '1 month',
    subscription_ends_at = null,
    founding_member = v_founding_member,
    founding_expires_at = v_founding_expires_at,
    updated_at = now()
  where user_id = p_user_id;

  return json_build_object(
    'ok', true,
    'already_processed', false,
    'founding_member', v_founding_member,
    'grant', v_grant,
    'current_tier', p_tier
  );
end;
$function$;

COMMENT ON FUNCTION public.grant_subscription(uuid, text, text, text) IS
  'KAN-85: new subscription or renewal. SETs subscription_grant_remaining to the tier base (x2 if founding window active). Claims a founding slot on first paid subscribe. Service-role only.';

REVOKE ALL ON FUNCTION public.grant_subscription(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_subscription(uuid, text, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- apply_upgrade: sweep leftover subscription grant into purchased, then SET
-- the new tier's full monthly bucket. Does not claim founding.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_upgrade(
  p_user_id uuid,
  p_new_tier text,
  p_webhook_id text,
  p_event_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_base integer;
  v_ent public.user_entitlements%rowtype;
  v_leftover integer;
  v_doubled boolean;
  v_grant integer;
begin
  if p_webhook_id is null or btrim(p_webhook_id) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_webhook_id');
  end if;
  if p_event_type is null or btrim(p_event_type) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_event_type');
  end if;
  if p_user_id is null then
    return json_build_object('ok', false, 'reason', 'invalid_user_id');
  end if;

  v_base := public.entitlement_tier_base(p_new_tier);
  if v_base is null then
    return json_build_object('ok', false, 'reason', 'invalid_tier');
  end if;

  if not exists (select 1 from public.users u where u.id = p_user_id) then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;

  insert into public.user_entitlements (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  if not public.claim_processed_webhook(p_webhook_id, p_event_type, p_user_id) then
    return json_build_object('ok', true, 'already_processed', true);
  end if;

  select * into v_ent
  from public.user_entitlements
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'apply_upgrade: entitlement row missing for %', p_user_id;
  end if;

  v_leftover := v_ent.subscription_grant_remaining;
  v_doubled := v_ent.founding_member
    and v_ent.founding_expires_at is not null
    and v_ent.founding_expires_at > now();
  v_grant := case when v_doubled then v_base * 2 else v_base end;

  update public.user_entitlements
  set
    purchased_balance = purchased_balance + v_leftover,
    subscription_grant_remaining = v_grant,
    current_tier = p_new_tier,
    subscription_reset_at = now() + interval '1 month',
    subscription_ends_at = null,
    updated_at = now()
  where user_id = p_user_id;

  return json_build_object(
    'ok', true,
    'already_processed', false,
    'swept', v_leftover,
    'grant', v_grant,
    'current_tier', p_new_tier
  );
end;
$function$;

COMMENT ON FUNCTION public.apply_upgrade(uuid, text, text, text) IS
  'KAN-85: upgrade. Moves leftover subscription grant into purchased_balance, then SETs the new tier full base (x2 if founding window active). Service-role only.';

REVOKE ALL ON FUNCTION public.apply_upgrade(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_upgrade(uuid, text, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- add_purchased: PAYG / top-up. Persistent; survives renewal and downgrade.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_purchased(
  p_user_id uuid,
  p_qty integer,
  p_webhook_id text,
  p_event_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_purchased integer;
begin
  if p_webhook_id is null or btrim(p_webhook_id) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_webhook_id');
  end if;
  if p_event_type is null or btrim(p_event_type) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_event_type');
  end if;
  if p_user_id is null then
    return json_build_object('ok', false, 'reason', 'invalid_user_id');
  end if;
  if p_qty is null or p_qty <= 0 then
    return json_build_object('ok', false, 'reason', 'invalid_qty');
  end if;

  if not exists (select 1 from public.users u where u.id = p_user_id) then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;

  insert into public.user_entitlements (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  if not public.claim_processed_webhook(p_webhook_id, p_event_type, p_user_id) then
    return json_build_object('ok', true, 'already_processed', true);
  end if;

  update public.user_entitlements
  set
    purchased_balance = purchased_balance + p_qty,
    updated_at = now()
  where user_id = p_user_id
  returning purchased_balance into v_purchased;

  if not found then
    raise exception 'add_purchased: entitlement row missing for %', p_user_id;
  end if;

  return json_build_object(
    'ok', true,
    'already_processed', false,
    'purchased_balance', v_purchased
  );
end;
$function$;

COMMENT ON FUNCTION public.add_purchased(uuid, integer, text, text) IS
  'KAN-85: PAYG/top-up. Adds to purchased_balance. Service-role only.';

REVOKE ALL ON FUNCTION public.add_purchased(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_purchased(uuid, integer, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- downgrade_to_free: failed-payment expiry / cancel-lapse. Zeroes the
-- subscription bucket; free grant, purchased, and founding stay.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.downgrade_to_free(
  p_user_id uuid,
  p_webhook_id text,
  p_event_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if p_webhook_id is null or btrim(p_webhook_id) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_webhook_id');
  end if;
  if p_event_type is null or btrim(p_event_type) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_event_type');
  end if;
  if p_user_id is null then
    return json_build_object('ok', false, 'reason', 'invalid_user_id');
  end if;

  if not exists (select 1 from public.users u where u.id = p_user_id) then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;

  insert into public.user_entitlements (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  if not public.claim_processed_webhook(p_webhook_id, p_event_type, p_user_id) then
    return json_build_object('ok', true, 'already_processed', true);
  end if;

  update public.user_entitlements
  set
    subscription_grant_remaining = 0,
    current_tier = null,
    subscription_reset_at = null,
    subscription_ends_at = null,
    updated_at = now()
  where user_id = p_user_id;

  if not found then
    raise exception 'downgrade_to_free: entitlement row missing for %', p_user_id;
  end if;

  return json_build_object('ok', true, 'already_processed', false);
end;
$function$;

COMMENT ON FUNCTION public.downgrade_to_free(uuid, text, text) IS
  'KAN-85: failed-payment / cancel-lapse. Zeroes subscription grant and clears tier/reset/ends_at. Service-role only.';

REVOKE ALL ON FUNCTION public.downgrade_to_free(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.downgrade_to_free(uuid, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- mark_cancellation: cancel-but-usable-until. Sets subscription_ends_at;
-- Phase 4 calls downgrade_to_free after that instant.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_cancellation(
  p_user_id uuid,
  p_ends_at timestamptz,
  p_webhook_id text,
  p_event_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if p_webhook_id is null or btrim(p_webhook_id) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_webhook_id');
  end if;
  if p_event_type is null or btrim(p_event_type) = '' then
    return json_build_object('ok', false, 'reason', 'invalid_event_type');
  end if;
  if p_user_id is null then
    return json_build_object('ok', false, 'reason', 'invalid_user_id');
  end if;
  if p_ends_at is null then
    return json_build_object('ok', false, 'reason', 'invalid_ends_at');
  end if;

  if not exists (select 1 from public.users u where u.id = p_user_id) then
    return json_build_object('ok', false, 'reason', 'user_not_found');
  end if;

  insert into public.user_entitlements (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  if not public.claim_processed_webhook(p_webhook_id, p_event_type, p_user_id) then
    return json_build_object('ok', true, 'already_processed', true);
  end if;

  update public.user_entitlements
  set
    subscription_ends_at = p_ends_at,
    updated_at = now()
  where user_id = p_user_id;

  if not found then
    raise exception 'mark_cancellation: entitlement row missing for %', p_user_id;
  end if;

  return json_build_object(
    'ok', true,
    'already_processed', false,
    'subscription_ends_at', p_ends_at
  );
end;
$function$;

COMMENT ON FUNCTION public.mark_cancellation(uuid, timestamptz, text, text) IS
  'KAN-85: cancel-but-usable-until. Sets subscription_ends_at only. Service-role only.';

REVOKE ALL ON FUNCTION public.mark_cancellation(uuid, timestamptz, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_cancellation(uuid, timestamptz, text, text) TO service_role;
