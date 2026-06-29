import {
  sendToSubscriptions,
  type PushPayload,
  type StoredSubscription,
} from "@/lib/push/web-push";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type PipelineRunWebhookPayload = {
  record?: {
    id?: unknown;
    recording_id?: unknown;
    user_id?: unknown;
    status?: unknown;
  };
  old_record?: {
    status?: unknown;
  };
};

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase service role is not configured");
  }

  return createServiceClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  const expected = process.env.PUSH_WEBHOOK_SECRET;
  const actual = req.headers.get("x-webhook-secret");
  if (!expected || actual !== expected) {
    return NextResponse.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 }
    );
  }

  const event = (await req
    .json()
    .catch(() => null)) as PipelineRunWebhookPayload | null;
  const record = event?.record;
  const oldRecord = event?.old_record;

  if (
    !record ||
    typeof record.id !== "string" ||
    typeof record.status !== "string"
  ) {
    return NextResponse.json(
      { ok: false, reason: "bad_payload" },
      { status: 400 }
    );
  }

  const status = record.status;
  const previousStatus =
    typeof oldRecord?.status === "string" ? oldRecord.status : undefined;
  if ((status !== "done" && status !== "failed") || status === previousStatus) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const userId = typeof record.user_id === "string" ? record.user_id : null;
  if (!userId) {
    return NextResponse.json({ ok: true, skipped: "no_owner" });
  }

  const admin = createAdminClient();
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subscriptions?.length) {
    return NextResponse.json({ ok: true, skipped: "no_subscriptions" });
  }

  const recordingId =
    typeof record.recording_id === "string" ? record.recording_id : null;
  const payload: PushPayload = {
    type: status === "failed" ? "RUN_FAILED" : "RUN_DONE",
    runId: record.id,
    recordingId,
    title:
      status === "failed" ? "A run needs attention" : "Your project is ready",
    body:
      status === "failed"
        ? "Tap to review and try again."
        : "Tap to see your competitors, PRD, brand and board.",
    url: recordingId ? `/ideas/${recordingId}` : `/runs/${record.id}`,
  };

  const { goneEndpoints, failed } = await sendToSubscriptions(
    subscriptions as StoredSubscription[],
    payload
  );

  if (failed.length > 0) {
    console.error("push dispatch partial failure", {
      runId: record.id,
      failed: failed.map(({ endpoint, statusCode, error }) => ({
        endpoint,
        statusCode,
        error,
      })),
    });
  }

  if (goneEndpoints.length > 0) {
    await admin
      .from("push_subscriptions")
      .delete()
      .in("endpoint", goneEndpoints);
  }

  return NextResponse.json({
    ok: true,
    sent: subscriptions.length - goneEndpoints.length - failed.length,
    failed: failed.length,
    pruned: goneEndpoints.length,
  });
}
