import { readFoundingCounter } from "@/lib/billing/foundingCounter.server";
import { NextResponse } from "next/server";

/**
 * GET /api/founding — { claimed, cap } for the founding-offer callout.
 * Read-only and display-only: not a billing request, touches no grant logic.
 * On failure returns 503 so the client falls back to the static callout.
 */
export async function GET() {
  try {
    const { claimed, cap } = await readFoundingCounter();
    return NextResponse.json(
      { ok: true, claimed, cap },
      { headers: { "Cache-Control": "private, max-age=60" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, reason: "founding_counter_unavailable" },
      { status: 503 }
    );
  }
}
