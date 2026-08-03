// lib/ideas/roadmap-client.ts
// Client fetch for Confluence-backed roadmap preview. No React.

import type { RoadmapPhaseCard } from "@/lib/ideas/roadmap-from-confluence";

export type RoadmapPreview = {
  pageId: string;
  title: string;
  phases: RoadmapPhaseCard[];
  phaseCount: number;
  milestoneCount: number;
  blurb?: string;
  excerpt?: string;
};

export type RoadmapPreviewResult =
  | { status: "ok"; data: RoadmapPreview }
  | { status: "error"; code: string; httpStatus: number };

export const fetchRoadmapPreview = async (
  pageId: string
): Promise<RoadmapPreviewResult> => {
  const res = await fetch(
    `/api/confluence/roadmap?pageId=${encodeURIComponent(pageId)}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    let code = "fetch_failed";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) code = body.error;
    } catch {
      /* ignore */
    }
    return { status: "error", code, httpStatus: res.status };
  }
  const data = (await res.json()) as RoadmapPreview;
  return { status: "ok", data };
};
