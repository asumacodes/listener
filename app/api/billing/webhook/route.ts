import { NextRequest, NextResponse } from "next/server";
import { createDodoClient } from "@/lib/billing/dodo";
import {
  handleDodoWebhook,
  type DodoWebhookEvent,
} from "@/lib/billing/dodoWebhook";

export const runtime = "nodejs";

const webhookHeaders = (req: NextRequest): Record<string, string> => ({
  "webhook-id": req.headers.get("webhook-id") ?? "",
  "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
  "webhook-signature": req.headers.get("webhook-signature") ?? "",
});

export async function POST(req: NextRequest) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, reason: "webhook_secret_missing" },
      { status: 501 }
    );
  }

  const webhookId = req.headers.get("webhook-id");
  if (!webhookId) {
    return NextResponse.json(
      { ok: false, reason: "webhook_id_missing" },
      { status: 400 }
    );
  }

  const raw = await req.text();

  let dodo;
  try {
    dodo = createDodoClient();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "dodo_not_configured" },
      { status: 501 }
    );
  }

  let event: DodoWebhookEvent;
  try {
    event = dodo.webhooks.unwrap(raw, {
      headers: webhookHeaders(req),
      key: secret,
    }) as DodoWebhookEvent;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_signature" },
      { status: 400 }
    );
  }

  try {
    const result = await handleDodoWebhook({ webhookId, event });
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, reason: "handler_failed" },
      { status: 500 }
    );
  }
}
