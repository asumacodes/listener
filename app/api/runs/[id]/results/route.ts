import { createClient } from "@/lib/supabase/server";
import type { RunResults } from "@/types/run-results";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: run, error: runError } = await supabase
    .from("pipeline_runs")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (runError || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (run.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: resultsRow, error: resultsError } = await supabase
    .from("run_results")
    .select("prd, competitors, brand, engineering, jira, confluence")
    .eq("run_id", id)
    .maybeSingle();

  if (resultsError) {
    return NextResponse.json({ error: resultsError.message }, { status: 400 });
  }

  if (!resultsRow) {
    return NextResponse.json({ data: null });
  }

  const results: RunResults = {
    transcript: null,
    prd: (resultsRow.prd as RunResults["prd"]) ?? null,
    competitors: (resultsRow.competitors as RunResults["competitors"]) ?? null,
    brand: (resultsRow.brand as RunResults["brand"]) ?? null,
    engineering: (resultsRow.engineering as RunResults["engineering"]) ?? null,
    jira: (resultsRow.jira as RunResults["jira"]) ?? null,
    confluence: (resultsRow.confluence as RunResults["confluence"]) ?? null,
  };

  return NextResponse.json({ data: results });
}
