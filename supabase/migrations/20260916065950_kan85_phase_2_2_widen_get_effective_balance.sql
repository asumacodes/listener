-- KAN-85 Phase 2.2: widen get_effective_balance to surface subscription/founding
-- fields for KAN-82 display + Profile breakdown. ADDITIVE ONLY — every existing
-- key (can_kickoff, bypass, free_grant_remaining, subscription_grant_remaining,
-- purchased_balance) is byte-identical; the 402-echo path and balance.ts preflight
-- must keep parsing unchanged. Body is the live self-heal version (20260724221557)
-- with only the json_build_object extended and the lazy-seed preserved verbatim.

CREATE OR REPLACE FUNCTION public.get_effective_balance()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_row public.user_entitlements%rowtype;
begin
  -- anon currently held EXECUTE; never invent a row without a session.
  if v_uid is null then
    return null;
  end if;

  select * into v_row
  from public.user_entitlements e
  where e.user_id = v_uid;

  if not found then
    -- Lazy-seed only when a users row already exists so an FK violation
    -- cannot turn a missing-entitlement anomaly into a 500 on the gate.
    insert into public.user_entitlements (user_id)
    select v_uid
    where exists (select 1 from public.users u where u.id = v_uid)
    on conflict (user_id) do nothing;

    select * into v_row
    from public.user_entitlements e
    where e.user_id = v_uid;

    if not found then
      return null;
    end if;
  end if;

  return json_build_object(
    -- existing keys — unchanged, same order, same semantics
    'can_kickoff', (
      v_row.bypass_free_tier
      or (v_row.free_grant_remaining
          + v_row.subscription_grant_remaining
          + v_row.purchased_balance) > 0
    ),
    'bypass', v_row.bypass_free_tier,
    'free_grant_remaining', v_row.free_grant_remaining,
    'subscription_grant_remaining', v_row.subscription_grant_remaining,
    'purchased_balance', v_row.purchased_balance,
    -- KAN-85 new fields (additive)
    'current_tier', v_row.current_tier,
    'subscription_reset_at', v_row.subscription_reset_at,
    'subscription_ends_at', v_row.subscription_ends_at,
    'founding_member', v_row.founding_member,
    'founding_expires_at', v_row.founding_expires_at
  );
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_effective_balance() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_effective_balance() TO authenticated, service_role;
