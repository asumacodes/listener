// app/api/bridge/runs/[runId]/atlassian-token/route.ts
//
// Bridge-facing broker endpoint. The Bridge calls this mid-run when it needs to
// create Jira/Confluence artifacts. Trust model: HMAC v1 (same secret as
// kickoff), broker-specific signing base, freshness window. NOT a user-session
// route - it's machine-to-machine, authenticated by signature only.
//
// Resolves run_id -> user_id, runs the token broker, returns a live access
// token + cloudId, OR a degrade signal the Bridge treats as "skip Atlassian".

import { getValidAtlassianToken } from "@/lib/integrations/atlassian/token-broker";
import { verifyBrokerSignature } from "@/lib/murmur/sign";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ runId: string }> };

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase_service_not_configured");
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { runId } = await params;
  const secret = process.env.MURMUR_HMAC_SECRET;
  if (!secret) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  // --- authenticate the Bridge ---
  const signatureHeader = req.headers.get("x-murmur-signature") ?? "";
  const timestamp = req.headers.get("x-murmur-timestamp") ?? "";
  const ok = await verifyBrokerSignature({
    runId,
    timestamp,
    signatureHeader,
    secret,
  });
  if (!ok) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  // --- resolve run -> user (service role; this is not a user session) ---
  let run: { id: string; user_id: string } | null = null;
  try {
    const { data, error } = await admin()
      .from("pipeline_runs")
      .select("id, user_id")
      .eq("id", runId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ status: "run_not_found" }, { status: 404 });
    }
    run = data;
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  // --- broker the token ---
  const result = await getValidAtlassianToken(run.user_id);

  if (result.status === "ok") {
    return NextResponse.json({
      status: "ok",
      accessToken: result.accessToken,
      cloudId: result.cloudId,
      siteUrl: result.siteUrl,
    });
  }

  // no_connection | connection_invalid -> Bridge skips Atlassian nodes.
  // 200, not an error status: degradation is a normal outcome, not a failure.
  return NextResponse.json({ status: result.status });
}
