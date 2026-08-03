"use client";

import {
  fetchRoadmapPreview,
  type RoadmapPreview,
} from "@/lib/ideas/roadmap-client";
import { useQuery } from "@tanstack/react-query";

export const confluenceRoadmapQueryKey = (pageId: string) =>
  ["confluence-roadmap", pageId] as const;

type RoadmapPreviewState =
  | { status: "idle" | "loading" }
  | { status: "ok"; data: RoadmapPreview }
  | { status: "error"; code: string };

/**
 * Fetch Confluence roadmap preview when pageId is present.
 * Uses React Query so Strict Mode / remounts share one in-flight request.
 */
export const useConfluenceRoadmap = (
  pageId: string | null | undefined
): RoadmapPreviewState => {
  const query = useQuery({
    queryKey: confluenceRoadmapQueryKey(pageId ?? ""),
    enabled: !!pageId,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async (): Promise<RoadmapPreview> => {
      const result = await fetchRoadmapPreview(pageId!);
      if (result.status === "error") {
        throw new Error(result.code);
      }
      return result.data;
    },
  });

  if (!pageId) return { status: "idle" };
  if (query.isPending || query.isLoading) return { status: "loading" };
  if (query.isError) {
    return {
      status: "error",
      code: query.error instanceof Error ? query.error.message : "fetch_failed",
    };
  }
  if (query.data) return { status: "ok", data: query.data };
  return { status: "loading" };
};
