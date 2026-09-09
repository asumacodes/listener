import { sendSupportAcknowledgement } from "@/lib/support/sendAcknowledgement";
import { createClient } from "@/lib/supabase/server";
import { after, NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SUBJECT_MAX = 150;
const MESSAGE_MAX = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isCategory = (
  value: unknown
): value is "bug" | "question" | "feature" | "other" =>
  value === "bug" ||
  value === "question" ||
  value === "feature" ||
  value === "other";

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
  const category = b.category;
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const pathname = typeof b.pathname === "string" ? b.pathname : "";
  const search = typeof b.search === "string" ? b.search : "";

  if (
    !isCategory(category) ||
    subject.length === 0 ||
    subject.length > SUBJECT_MAX ||
    message.length === 0 ||
    message.length > MESSAGE_MAX ||
    !EMAIL_RE.test(email)
  ) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const route = pathname === "" ? null : pathname + search;

  const { data: inserted, error: insertError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      message,
      category,
      email,
      route,
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
    await sendSupportAcknowledgement({
      ticketId: inserted.id,
      subject,
      category,
      email,
    });
  });

  return NextResponse.json({ ok: true, id: inserted.id });
}
