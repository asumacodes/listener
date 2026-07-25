"use client";

import useProjectsQuery from "@/hooks/useProjectsQuery";
import { colorHex, isProjectColor } from "@/lib/palette";
import { useMemo } from "react";

/** Project id → dot hex for search rows. */
export const useProjectColorMap = () => {
  const { data: projects } = useProjectsQuery();

  return useMemo(
    () =>
      Object.fromEntries(
        (projects ?? []).map((project) => [
          project.id,
          colorHex(isProjectColor(project.color) ? project.color : "sand"),
        ])
      ),
    [projects]
  );
};

export default useProjectColorMap;
