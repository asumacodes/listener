"use client";

import {
  assignRecordingToProject,
  listProjects,
  type Project,
} from "@/lib/projects";
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

  return {
    projects: enabled ? projects : [],
    selectedId: enabled ? selectedId : null,
    isSaving,
    error,
    onSelect,
  };
};

export default useProjectPicker;
