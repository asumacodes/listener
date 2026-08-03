// app/api/confluence/roadmap/route.ts
// Fetch + parse the user's Confluence roadmap page for the desktop reading pane.

import { fetchConfluencePageBody } from "@/lib/integrations/atlassian/confluence";
import { getValidAtlassianToken } from "@/lib/integrations/atlassian/token-broker";
import { parseRoadmapFromConfluence } from "@/lib/ideas/roadmap-from-confluence";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pageId = new URL(request.url).searchParams.get("pageId")?.trim();
  if (!pageId) {
    return NextResponse.json({ error: "pageId_required" }, { status: 400 });
  }

  const broker = await getValidAtlassianToken(user.id);
  if (
    broker.status === "no_connection" ||
    broker.status === "connection_invalid"
  ) {
    return NextResponse.json(
      { error: "atlassian_disconnected" },
      { status: 401 }
    );
  }

  const page = await fetchConfluencePageBody({
    cloudId: broker.cloudId,
    accessToken: broker.accessToken,
    pageId,
  });

  if (page.status === "unauthorized") {
    return NextResponse.json(
      { error: "atlassian_unauthorized" },
      { status: 401 }
    );
  }
  if (page.status === "not_found") {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }
  if (page.status !== "ok") {
    return NextResponse.json(
      { error: page.message ?? "confluence_upstream" },
      { status: 502 }
    );
  }

  const parsed = parseRoadmapFromConfluence(page.storageHtml);

  return NextResponse.json({
    pageId: page.pageId,
    title: page.title,
    phases: parsed.phases,
    phaseCount: parsed.phases.length,
    milestoneCount: parsed.milestoneCount,
    blurb: parsed.blurb,
    excerpt: parsed.excerpt,
  });
}
