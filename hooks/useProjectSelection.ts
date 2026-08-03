"use client";

import { projectsQueryKey, useProjectsQuery } from "@/hooks/useProjectsQuery";
import { createProject } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import type { ProjectColor } from "@/lib/palette";
import type { ProjectWithRollup } from "@/lib/projects/rollup";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export type UseProjectSelectionOptions = {
  enabled?: boolean;
  /** When set, selection tracks this id (idea assign). Otherwise seeds the default project. */
  initialProjectId?: string | null;
};

export type ProjectSelection = {
  projects: ProjectWithRollup[];
  selectedId: string | null;
  label: string;
  error: string | null;
  onSelect: (projectId: string) => void;
  onCreateAndSelect: (name: string, color: ProjectColor) => Promise<Project>;
  reset: () => void;
};

/**
 * Shared project list + local selection. Pair with ProjectPickerBody /
 * DesktopProjectPicker / ProjectSheet for UI.
 * Does not assign recordings — use useProjectPicker for that.
 */
const useProjectSelection = ({
  enabled = true,
  initialProjectId = null,
}: UseProjectSelectionOptions = {}): ProjectSelection => {
  const queryClient = useQueryClient();
  const projectsQuery = useProjectsQuery(enabled);
  const projects = useMemo(
    () => projectsQuery.data ?? [],
    [projectsQuery.data]
  );
  const [selectedId, setSelectedId] = useState<string | null>(initialProjectId);
  const [syncedInitialId, setSyncedInitialId] = useState(initialProjectId);

  const defaultId =
    projects.find((p) => p.is_default)?.id ?? projects[0]?.id ?? null;

  if (enabled && initialProjectId !== syncedInitialId) {
    setSyncedInitialId(initialProjectId);
    setSelectedId(initialProjectId);
  }

  if (enabled && selectedId === null && initialProjectId == null && defaultId) {
    setSelectedId(defaultId);
  }

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId]
  );

  const reset = useCallback(() => {
    setSelectedId(null);
    setSyncedInitialId(null);
  }, []);

  const onSelect = useCallback((projectId: string) => {
    setSelectedId(projectId);
  }, []);

  const onCreateAndSelect = useCallback(
    async (name: string, color: ProjectColor) => {
      const project = await createProject(name, color);
      setSelectedId(project.id);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      return project;
    },
    [queryClient]
  );

  return {
    projects: enabled ? projects : [],
    selectedId: enabled ? selectedId : null,
    label: selected?.name ?? "Uncategorised",
    error:
      projectsQuery.error instanceof Error ? projectsQuery.error.message : null,
    onSelect,
    onCreateAndSelect,
    reset,
  };
};

export default useProjectSelection;
