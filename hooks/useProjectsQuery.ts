"use client";

import {
  listProjectsWithRollup,
  type ProjectWithRollup,
} from "@/lib/projects/rollup";
import { useQuery } from "@tanstack/react-query";

export const projectsQueryKey = ["projects"] as const;

export const useProjectsQuery = (enabled = true) =>
  useQuery<ProjectWithRollup[], Error>({
    queryKey: projectsQueryKey,
    queryFn: listProjectsWithRollup,
    enabled,
  });

export default useProjectsQuery;
