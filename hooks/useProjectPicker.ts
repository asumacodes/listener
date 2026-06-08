"use client";

import {
  assignRecordingToProject,
  createProject,
  listProjectsWithCounts,
  type ProjectWithCount,
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
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentProjectId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedProjectId, setSyncedProjectId] = useState(currentProjectId);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [savedTo, setSavedTo] = useState<string | null>(null);

  if (currentProjectId !== syncedProjectId && !isSaving) {
    setSyncedProjectId(currentProjectId);
    setSelectedId(currentProjectId);
  }

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    listProjectsWithCounts()
      .then((p) => active && setProjects(p))
      .catch(
        (e) =>
          active && setError(e instanceof Error ? e.message : "Failed to load")
      );
    return () => {
      active = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!savedTo) return;
    const t = setTimeout(() => setSavedTo(null), 2500);
    return () => clearTimeout(t);
  }, [savedTo]);

  const onSelect = useCallback(
    async (projectId: string) => {
      if (!enabled || projectId === selectedId) return;
      setIsSaving(true);
      setError(null);
      const previous = selectedId;
      setSelectedId(projectId);
      try {
        await assignRecordingToProject(recordingId, projectId);
        const project = projects.find((p) => p.id === projectId);
        setSavedTo(project?.name ?? "project");
        onAssigned?.(projectId, project?.is_default ?? false);
      } catch (e) {
        setSelectedId(previous);
        setSavedTo(null);
        setError(e instanceof Error ? e.message : "Couldn't move recording");
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, recordingId, selectedId, onAssigned, projects]
  );

  const onCreateAndAssign = useCallback(
    async (name: string, color: ProjectColor) => {
      const project = await createProject(name, color);
      await assignRecordingToProject(recordingId, project.id);
      setProjects((prev) => [...prev, { ...project, recording_count: 1 }]);
      setSelectedId(project.id);
      setSavedTo(project.name);
      onAssigned?.(project.id, project.is_default);
    },
    [recordingId, onAssigned]
  );

  return {
    projects: enabled ? projects : [],
    selectedId: enabled ? selectedId : null,
    isSaving,
    error,
    savedTo,
    onSelect,
    createSheetOpen,
    onOpenCreateSheet: () => setCreateSheetOpen(true),
    onCloseCreateSheet: () => setCreateSheetOpen(false),
    onCreateAndAssign,
  };
};

export default useProjectPicker;
