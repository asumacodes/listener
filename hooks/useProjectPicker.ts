"use client";

import {
  assignRecordingToProject,
  createProject,
  listProjects,
  type Project,
} from "@/lib/projects";
import type { ProjectColor } from "@/lib/palette";
import type {
  ProjectPickerViewProps,
  UseProjectPickerOptions,
} from "@/types/project";
import { useCallback, useEffect, useState } from "react";

const useProjectPicker = ({
  recordingId,
  currentProjectId,
  enabled = true,
  onAssigned,
}: UseProjectPickerOptions): ProjectPickerViewProps => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentProjectId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedProjectId, setSyncedProjectId] = useState(currentProjectId);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  if (currentProjectId !== syncedProjectId && !isSaving) {
    setSyncedProjectId(currentProjectId);
    setSelectedId(currentProjectId);
  }

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    listProjects()
      .then((p) => active && setProjects(p))
      .catch(
        (e) =>
          active && setError(e instanceof Error ? e.message : "Failed to load")
      );
    return () => {
      active = false;
    };
  }, [enabled]);

  const onSelect = useCallback(
    async (projectId: string) => {
      if (!enabled || projectId === selectedId) return;
      setIsSaving(true);
      setError(null);
      const previous = selectedId;
      setSelectedId(projectId);
      try {
        await assignRecordingToProject(recordingId, projectId);
        onAssigned?.(projectId);
      } catch (e) {
        setSelectedId(previous);
        setError(e instanceof Error ? e.message : "Couldn't move recording");
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, recordingId, selectedId, onAssigned]
  );

  const onCreateAndAssign = useCallback(
    async (name: string, color: ProjectColor) => {
      const project = await createProject(name, color);
      await assignRecordingToProject(recordingId, project.id);
      setProjects((prev) => [...prev, project]);
      setSelectedId(project.id);
      onAssigned?.(project.id);
    },
    [recordingId, onAssigned]
  );

  return {
    projects: enabled ? projects : [],
    selectedId: enabled ? selectedId : null,
    isSaving,
    error,
    onSelect,
    createSheetOpen,
    onOpenCreateSheet: () => setCreateSheetOpen(true),
    onCloseCreateSheet: () => setCreateSheetOpen(false),
    onCreateAndAssign,
  };
};

export default useProjectPicker;
