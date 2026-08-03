"use client";

import useProjectSelection from "@/hooks/useProjectSelection";
import { assignRecordingToProject } from "@/lib/projects";
import { projectsQueryKey } from "@/hooks/useProjectsQuery";
import type { ProjectColor } from "@/lib/palette";
import type {
  ProjectPickerViewProps,
  UseProjectPickerOptions,
} from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

/**
 * Project selection that persists onto an existing recording.
 * Built on useProjectSelection — capture (pre-save) uses that hook directly.
 */
const useProjectPicker = ({
  recordingId,
  currentProjectId,
  enabled = true,
  onAssigned,
}: UseProjectPickerOptions): ProjectPickerViewProps => {
  const queryClient = useQueryClient();
  const {
    projects,
    selectedId,
    error: selectionError,
    onSelect: selectLocal,
    onCreateAndSelect,
  } = useProjectSelection({
    enabled,
    initialProjectId: currentProjectId,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [savedTo, setSavedTo] = useState<string | null>(null);

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
      selectLocal(projectId);
      try {
        await assignRecordingToProject(recordingId, projectId);
        const project = projects.find((p) => p.id === projectId);
        setSavedTo(project?.name ?? "project");
        onAssigned?.(projectId, project?.is_default ?? false);
        await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      } catch (e) {
        if (previous) selectLocal(previous);
        setSavedTo(null);
        setActionError(
          e instanceof Error ? e.message : "Couldn't move recording"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      enabled,
      recordingId,
      selectedId,
      selectLocal,
      projects,
      onAssigned,
      queryClient,
    ]
  );

  const onCreateAndAssign = useCallback(
    async (name: string, color: ProjectColor) => {
      const project = await onCreateAndSelect(name, color);
      await assignRecordingToProject(recordingId, project.id);
      setSavedTo(project.name);
      onAssigned?.(project.id, project.is_default);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
    [recordingId, onAssigned, queryClient, onCreateAndSelect]
  );

  return {
    projects,
    selectedId,
    isSaving,
    error: actionError ?? selectionError,
    savedTo,
    onSelect,
    createSheetOpen,
    onOpenCreateSheet: () => setCreateSheetOpen(true),
    onCloseCreateSheet: () => setCreateSheetOpen(false),
    onCreateAndAssign,
  };
};

export default useProjectPicker;
