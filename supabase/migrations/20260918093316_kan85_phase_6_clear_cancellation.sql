-- KAN-85 Phase 6.2: clear scheduled cancel without touching the monthly bucket.
-- Resume-before-period-end. Does NOT re-grant (grant_subscription would reset
-- subscription_grant_remaining — wrong; ideas were never taken).

CREATE OR REPLACE FUNCTION public.clear_cancellation(
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
    subscription_ends_at = null,
    updated_at = now()
  where user_id = p_user_id;

  if not found then
    raise exception 'clear_cancellation: entitlement row missing for %', p_user_id;
  end if;

  return json_build_object(
    'ok', true,
    'already_processed', false,
    'subscription_ends_at', null
  );
end;
$function$;

COMMENT ON FUNCTION public.clear_cancellation(uuid, text, text) IS
  'KAN-85: resume-before-period-end. Nulls subscription_ends_at only. Does not re-grant. Service-role only.';

REVOKE ALL ON FUNCTION public.clear_cancellation(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.clear_cancellation(uuid, text, text) TO service_role;
