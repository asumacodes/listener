"use client";

import { listProjects } from "@/lib/projects";
import { colorHex, isProjectColor } from "@/lib/palette";
import { useEffect, useState } from "react";

/** Project id → dot hex for search rows. */
export const useProjectColorMap = () => {
  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void listProjects().then((projects) => {
      if (cancelled) return;
      setColorMap(
        Object.fromEntries(
          projects.map((p) => [
            p.id,
            colorHex(isProjectColor(p.color) ? p.color : "sand"),
          ])
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return colorMap;
};

export default useProjectColorMap;
