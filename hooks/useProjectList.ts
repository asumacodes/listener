"use client";

import type { ProjectColor } from "@/lib/palette";
import {
  createProject,
  deleteProject,
  listProjectsWithCounts,
  renameProject,
  type ProjectWithCount,
} from "@/lib/projects";
import type {
  ProjectDeleteTarget,
  ProjectListViewProps,
} from "@/types/project";
import { useCallback, useEffect, useState } from "react";

const useProjectList = (): ProjectListViewProps => {
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<ProjectColor>("gold");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectDeleteTarget | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setProjects(await listProjectsWithCounts());
  }, []);

  useEffect(() => {
    let active = true;
    listProjectsWithCounts()
      .then((data) => active && setProjects(data))
      .catch(
        (e) =>
          active && setError(e instanceof Error ? e.message : "Failed to load")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const onCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createProject(newName, newColor);
      setNewName("");
      setNewColor("gold");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }, [newName, newColor, refresh]);

  const onRename = useCallback(
    async (id: string, current: string) => {
      const next = window.prompt("Rename project", current);
      if (!next || next.trim() === current) return;
      setError(null);
      try {
        await renameProject(id, next);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to rename");
      }
    },
    [refresh]
  );

  const onRequestDelete = useCallback(
    (id: string, name: string, count: number) => {
      setDeleteTarget({ id, name, recordingCount: count });
    },
    []
  );

  const onCancelDelete = useCallback(() => {
    if (isDeleting) return;
    setDeleteTarget(null);
  }, [isDeleting]);

  const onConfirmDelete = useCallback(async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDeleting, refresh]);

  return {
    projects,
    loading,
    error,
    newName,
    newColor,
    creating,
    deleteTarget,
    isDeleting,
    onNewNameChange: setNewName,
    onNewColorChange: setNewColor,
    onCreate,
    onRename,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
  };
};

export default useProjectList;
