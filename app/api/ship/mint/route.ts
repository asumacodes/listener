import {
  createShipAdminClient,
  hashShipToken,
} from "@/lib/feedback-prompts/shipToken";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// URL host from env. House pattern: localhost fallback, NEVER silent-prod —
// a missing env on local/preview must not mint prod URLs against dev rows.
const APP_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type CreateRow = {
  id?: string | null;
  should_send?: boolean | null;
};

export async function POST(req: NextRequest) {
  const provided = req.headers.get("x-webhook-secret");
  const expected = process.env.SHIP_MINT_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, reason: "not_configured" },
      { status: 500 }
    );
  }
  const ok =
    provided != null &&
    provided.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  if (!ok) {
    return NextResponse.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const runId: unknown = body?.run_id;
  const userId: unknown = body?.user_id;
  if (typeof runId !== "string" || typeof userId !== "string") {
    return NextResponse.json(
      { ok: false, reason: "bad_input" },
      { status: 400 }
    );
  }

  // 32 random bytes → 43-char base64url. Inside the tap route's 16..200 guard.
  const secret = crypto.randomBytes(32).toString("base64url");
  const hash = hashShipToken(secret);

  const supabase = createShipAdminClient();
  const { data, error } = await supabase.rpc("create_ship_followup", {
    p_run_id: runId,
    p_user_id: userId,
    p_ship_token_hash: hash,
  });
  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "42501") {
      return NextResponse.json(
        { ok: false, reason: "run_invalid" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { ok: false, reason: "rpc_failed" },
      { status: 500 }
    );
  }

  const row = (Array.isArray(data) ? data[0] : data) as CreateRow | undefined;
  const id: string | null = row?.id ?? null;
  const shouldSend: boolean = row?.should_send ?? false;
  if (!id) {
    return NextResponse.json({ ok: false, reason: "no_row" }, { status: 500 });
  }

  // URL carries the raw secret; only the hash was stored.
  // should_send=false → url stays null (already mailed; secret was never stored).
  let url: string | null = null;
  if (shouldSend) {
    if (!APP_ORIGIN) {
      return NextResponse.json(
        { ok: false, reason: "origin_not_configured" },
        { status: 500 }
      );
    }
    url = new URL(
      `/api/ship/${encodeURIComponent(secret)}`,
      APP_ORIGIN
    ).toString();
  }

  return NextResponse.json({
    ok: true,
    id,
    should_send: shouldSend,
    url,
  });
}
