import { forwardFeedbackEmail } from "@/lib/feedback/forwardEmail";
import { resolveRunId } from "@/lib/feedback/resolveRunId";
import { createClient } from "@/lib/supabase/server";
import { after, NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BODY_MAX = 4000;

const isRating = (value: unknown): value is "up" | "neutral" | "down" =>
  value === "up" || value === "neutral" || value === "down";

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

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const b =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const rating = b.rating;
  const body = typeof b.body === "string" ? b.body.trim() : "";
  const rawEmail = typeof b.email === "string" ? b.email.trim() : "";
  const email = rawEmail === "" ? null : rawEmail;
  const pathname = typeof b.pathname === "string" ? b.pathname : "";
  const search = typeof b.search === "string" ? b.search : "";
  const selectedRun = new URLSearchParams(search).get("run");

  if (
    !isRating(rating) ||
    body.length === 0 ||
    body.length > BODY_MAX ||
    pathname === ""
  ) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const route = pathname + search;
  const runId = await resolveRunId(supabase, user.id, pathname, selectedRun);

  const { data: inserted, error: insertError } = await supabase
    .from("feedback")
    .insert({
      user_id: user.id,
      rating,
      body,
      email,
      route,
      run_id: runId,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { ok: false, reason: "persist_failed" },
      { status: 500 }
    );
  }

  after(async () => {
    await forwardFeedbackEmail({
      feedbackId: inserted.id,
      userId: user.id,
      rating,
      body,
      email,
      route,
      runId,
    });
  });

  return NextResponse.json({ ok: true, id: inserted.id });
}
