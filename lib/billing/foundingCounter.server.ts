// SERVER-ONLY. Read-only view of public.founding_counter for the picker's
// scarcity callout. The table is service-role only (RLS default-deny), so the
// browser can't read it directly. This never writes; grant_subscription stays
// the only writer (FOR UPDATE + increment).

import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { FoundingCounter } from "@/lib/billing/foundingView";

/** The count moves at most once per paid subscribe — a minute is plenty fresh. */
const CACHE_MS = 60_000;

let cached: { value: FoundingCounter; at: number } | null = null;

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase_service_not_configured");
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Throws on any failure — callers fail closed to the static (numberless)
 * founding treatment, never to a guessed count.
 */
export async function readFoundingCounter(): Promise<FoundingCounter> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const { data, error } = await admin()
    .from("founding_counter")
    .select("claimed, cap")
    .eq("id", true)
    .single();
  if (error || !data) throw new Error("founding_counter_unavailable");

  const value = { claimed: Number(data.claimed), cap: Number(data.cap) };
  cached = { value, at: Date.now() };
  return value;
}
