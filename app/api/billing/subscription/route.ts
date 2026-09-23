import { NextRequest, NextResponse } from "next/server";
import { createDodoClient } from "@/lib/billing/dodo";
import { readDodoSubscriptionId } from "@/lib/billing/dodoSubscriptionId";
import { createClient } from "@/lib/supabase/server";

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
    cancel_at_next_billing_date?: unknown;
  } | null;
  if (typeof body?.cancel_at_next_billing_date !== "boolean") {
    return NextResponse.json(
      { ok: false, reason: "invalid_cancel_flag" },
      { status: 400 }
    );
  }

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
    // Period-end only. Never pass status: "cancelled" — that would revoke
    // paid-through ideas immediately.
    await dodo.subscriptions.update(subId, {
      cancel_at_next_billing_date: body.cancel_at_next_billing_date,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        reason: "dodo_subscription_update_failed",
        detail: String(e),
      },
      { status: 502 }
    );
  }
}
