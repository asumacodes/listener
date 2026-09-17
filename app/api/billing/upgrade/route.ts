import { NextRequest, NextResponse } from "next/server";
import { parsePaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { createDodoClient, DODO_PRODUCTS } from "@/lib/billing/dodo";
import { createClient } from "@/lib/supabase/server";

type EntitlementDodoRow = { dodo_subscription_id: string | null };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, reason: "unauthenticated" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    new_tier?: unknown;
  } | null;
  const newTier = parsePaidCheckoutTier(
    typeof body?.new_tier === "string" ? body.new_tier : null
  );
  if (!newTier) {
    return NextResponse.json(
      { ok: false, reason: "invalid_tier" },
      { status: 400 }
    );
  }

  // Column is added in Phase 4 from subscription.active. Missing column or
  // null value → 501. Do not invent a lookup.
  const { data, error } = await supabase
    .from("user_entitlements" as never)
    .select("dodo_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const subId = (data as EntitlementDodoRow | null)?.dodo_subscription_id;
  if (error || !subId) {
    return NextResponse.json(
      { ok: false, reason: "subscription_id_unavailable" },
      { status: 501 }
    );
  }

  let dodo;
  try {
    dodo = createDodoClient();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "dodo_not_configured" },
      { status: 501 }
    );
  }

  try {
    // full_immediately: bill the full new-tier price (locked anti-arbitrage
    // policy). difference_immediately would reopen the $19+$49+$79 ladder.
    await dodo.subscriptions.changePlan(subId, {
      product_id: DODO_PRODUCTS[newTier].productId,
      proration_billing_mode: "full_immediately",
      on_payment_failure: "prevent_change",
      quantity: 1,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "dodo_upgrade_failed", detail: String(e) },
      { status: 502 }
    );
  }
}
