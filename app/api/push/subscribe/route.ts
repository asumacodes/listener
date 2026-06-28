import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type SubscriptionBody = {
  endpoint?: unknown;
  p256dh?: unknown;
  auth?: unknown;
  userAgent?: unknown;
};

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

  const body = (await req.json().catch(() => null)) as SubscriptionBody | null;
  if (
    !body ||
    typeof body.endpoint !== "string" ||
    typeof body.p256dh !== "string" ||
    typeof body.auth !== "string"
  ) {
    return NextResponse.json(
      { ok: false, reason: "invalid_subscription" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      auth: body.auth,
      user_agent: typeof body.userAgent === "string" ? body.userAgent : null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json(
      { ok: false, reason: "persist_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
