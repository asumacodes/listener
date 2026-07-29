"use client";

import { assignRecordingToProject, createProject } from "@/lib/projects";
import { projectsQueryKey, useProjectsQuery } from "@/hooks/useProjectsQuery";
import type { ProjectColor } from "@/lib/palette";
import type {
  ProjectPickerViewProps,
  UseProjectPickerOptions,
} from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const useProjectPicker = ({
  recordingId,
  currentProjectId,
  enabled = true,
  onAssigned,
}: UseProjectPickerOptions): ProjectPickerViewProps => {
  const queryClient = useQueryClient();
  const projectsQuery = useProjectsQuery(enabled);
  const projects = useMemo(
    () => projectsQuery.data ?? [],
    [projectsQuery.data]
  );
  const [selectedId, setSelectedId] = useState<string | null>(currentProjectId);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [syncedProjectId, setSyncedProjectId] = useState(currentProjectId);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [savedTo, setSavedTo] = useState<string | null>(null);

  if (currentProjectId !== syncedProjectId && !isSaving) {
    setSyncedProjectId(currentProjectId);
    setSelectedId(currentProjectId);
  }

  useEffect(() => {
    if (!savedTo) return;
    const t = setTimeout(() => setSavedTo(null), 2500);
    return () => clearTimeout(t);
  }, [savedTo]);

  const onSelect = useCallback(
    async (projectId: string) => {
      if (!enabled || projectId === selectedId) return;
      setIsSaving(true);
      setActionError(null);
      const previous = selectedId;
      setSelectedId(projectId);
      try {
        await assignRecordingToProject(recordingId, projectId);
        const project = projects.find((p) => p.id === projectId);
        setSavedTo(project?.name ?? "project");
        onAssigned?.(projectId, project?.is_default ?? false);
        await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      } catch (e) {
        setSelectedId(previous);
        setSavedTo(null);
        setActionError(
          e instanceof Error ? e.message : "Couldn't move recording"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, recordingId, selectedId, onAssigned, projects, queryClient]
  );

  const onCreateAndAssign = useCallback(
    async (name: string, color: ProjectColor) => {
      const project = await createProject(name, color);
      await assignRecordingToProject(recordingId, project.id);
      setSelectedId(project.id);
      setSavedTo(project.name);
      onAssigned?.(project.id, project.is_default);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
    [recordingId, onAssigned, queryClient]
  );

  return {
    projects: enabled ? projects : [],
    selectedId: enabled ? selectedId : null,
    isSaving,
    error:
      actionError ??
      (projectsQuery.error instanceof Error
        ? projectsQuery.error.message
        : null),
    savedTo,
    onSelect,
    createSheetOpen,
    onOpenCreateSheet: () => setCreateSheetOpen(true),
    onCloseCreateSheet: () => setCreateSheetOpen(false),
    onCreateAndAssign,
  };
};

export default useProjectPicker;
