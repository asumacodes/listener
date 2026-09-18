import { NextRequest, NextResponse } from "next/server";
import {
  billingSuccessUrl,
  withHostedCheckoutReturn,
} from "@/lib/billing/checkoutReturn";
import { parsePaidCheckoutTier } from "@/lib/billing/checkoutTier";
import { createDodoClient, DODO_PRODUCTS } from "@/lib/billing/dodo";
import { readDodoSubscriptionId } from "@/lib/billing/dodoSubscriptionId";
import { createClient } from "@/lib/supabase/server";
import { ConflictError, UnprocessableEntityError } from "dodopayments";

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
  const subId = await readDodoSubscriptionId(user.id);
  if (!subId) {
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
    // collect_via_payment_link: force hosted on-session collection. Off-session
    // changePlan works for saved cards (null payment_link, {} body, plan still
    // changes) but UPI cannot authenticate off-session — this flag is the
    // universal path for both.
    const changed = await dodo.subscriptions.changePlan(subId, {
      product_id: DODO_PRODUCTS[newTier].productId,
      proration_billing_mode: "full_immediately",
      on_payment_failure: "prevent_change",
      quantity: 1,
      collect_via_payment_link: true,
      metadata: { user_id: user.id },
    });
    const paymentLink = changed.payment_link;
    // Null payment_link is not a universal failure: without this flag, a
    // successful off-session card settlement returns {}. With the flag set,
    // a real charge must include a hosted link — missing it is a 502.
    if (typeof paymentLink !== "string" || paymentLink.length === 0) {
      return NextResponse.json(
        { ok: false, reason: "missing_payment_link" },
        { status: 502 }
      );
    }
    let returnedLink: string;
    try {
      returnedLink = withHostedCheckoutReturn(
        paymentLink,
        billingSuccessUrl("upgrade")
      );
    } catch {
      return NextResponse.json(
        { ok: false, reason: "missing_payment_link" },
        { status: 502 }
      );
    }
    return NextResponse.json({ payment_link: returnedLink });
  } catch (e) {
    if (e instanceof ConflictError) {
      return NextResponse.json(
        { ok: false, reason: "upgrade_pending" },
        { status: 409 }
      );
    }
    if (e instanceof UnprocessableEntityError) {
      return NextResponse.json(
        { ok: false, reason: "dodo_not_configured" },
        { status: 501 }
      );
    }
    return NextResponse.json(
      { ok: false, reason: "dodo_upgrade_failed", detail: String(e) },
      { status: 502 }
    );
  }
}
