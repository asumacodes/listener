import { NextRequest, NextResponse } from "next/server";
import { billingSuccessUrl } from "@/lib/billing/checkoutReturn";
import {
  parsePaidCheckoutTier,
  type PaidCheckoutTier,
} from "@/lib/billing/checkoutTier";
import { createDodoClient, DODO_PAYG, DODO_PRODUCTS } from "@/lib/billing/dodo";
import { createClient } from "@/lib/supabase/server";

const isCheckoutIntent = (
  value: unknown
): value is "subscribe" | "topup" | "payg" =>
  value === "subscribe" || value === "topup" || value === "payg";

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
    intent?: unknown;
    tier?: unknown;
  } | null;

  if (!body || !isCheckoutIntent(body.intent)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_intent" },
      { status: 400 }
    );
  }

  let productId: string;
  // Copy hint on the return screen only — never proof of a grant.
  let returnTier: PaidCheckoutTier | undefined;
  if (body.intent === "payg") {
    productId = DODO_PAYG.productId;
  } else {
    const tier = parsePaidCheckoutTier(
      typeof body.tier === "string" ? body.tier : null
    );
    if (!tier) {
      return NextResponse.json(
        { ok: false, reason: "invalid_tier" },
        { status: 400 }
      );
    }
    returnTier = tier;
    productId =
      body.intent === "topup"
        ? DODO_PRODUCTS[tier].topUp.productId
        : DODO_PRODUCTS[tier].productId;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    typeof profile?.display_name === "string" && profile.display_name.trim()
      ? profile.display_name.trim()
      : undefined;

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
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      // Prefill/receipts only. Phone-only users have no email — omit customer
      // so Dodo collects it at hosted checkout. Do not invent an address.
      ...(user.email
        ? {
            customer: {
              email: user.email,
              ...(displayName ? { name: displayName } : {}),
            },
          }
        : {}),
      return_url: billingSuccessUrl(body.intent, returnTier),
      // Auth UUID — Phase 4 join key. Phone-only users have no email; do not
      // replace this with email reconciliation.
      metadata: { user_id: user.id },
    });

    if (!session.checkout_url) {
      return NextResponse.json(
        { ok: false, reason: "missing_checkout_url" },
        { status: 502 }
      );
    }

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "dodo_session_failed", detail: String(e) },
      { status: 502 }
    );
  }
}
