"use client";

import type { ProjectColor } from "@/lib/palette";
import {
  createProject,
  deleteProject,
  listProjectsWithCounts,
  updateProject,
  type ProjectWithCount,
} from "@/lib/projects";
import type {
  ProjectDeleteTarget,
  ProjectFormMode,
  ProjectListFormState,
  ProjectListViewProps,
} from "@/types/project";
import { useCallback, useEffect, useState } from "react";

const LIST_CREATE_MODE: ProjectFormMode = {
  kind: "create",
  context: "list",
};

const useProjectList = (): ProjectListViewProps => {
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectListFormState>({ kind: "closed" });
  const [lastFormMode, setLastFormMode] =
    useState<ProjectFormMode>(LIST_CREATE_MODE);
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

  const onOpenCreate = useCallback(() => {
    setLastFormMode(LIST_CREATE_MODE);
    setForm({ kind: "create" });
  }, []);

  const onCloseForm = useCallback(() => setForm({ kind: "closed" }), []);

  const onOpenEdit = useCallback((project: ProjectWithCount) => {
    setLastFormMode({
      kind: "edit",
      initialName: project.name,
      initialColor: project.color,
    });
    setForm({ kind: "edit", project });
  }, []);

  const onSubmitForm = useCallback(
    async (name: string, color: ProjectColor) => {
      setError(null);
      if (form.kind === "create") {
        await createProject(name, color);
      } else if (form.kind === "edit") {
        await updateProject(form.project.id, name, color);
      }
      await refresh();
    },
    [form, refresh]
  );

  const onRequestDeleteFromEdit = useCallback(() => {
    if (form.kind !== "edit") return;
    const { id, name, recording_count } = form.project;
    setForm({ kind: "closed" });
    setDeleteTarget({ id, name, recordingCount: recording_count });
  }, [form]);

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

  const formOpen = form.kind !== "closed";
  const formMode: ProjectFormMode =
    form.kind === "edit"
      ? {
          kind: "edit",
          initialName: form.project.name,
          initialColor: form.project.color,
        }
      : form.kind === "create"
        ? LIST_CREATE_MODE
        : lastFormMode;
  const formResetKey =
    form.kind === "edit" ? `edit-${form.project.id}` : "create-list";

  return {
    projects,
    loading,
    error,
    form,
    formOpen,
    formMode,
    formResetKey,
    deleteTarget,
    isDeleting,
    onOpenCreate,
    onCloseForm,
    onSubmitForm,
    onOpenEdit,
    onRequestDeleteFromEdit,
    onCancelDelete,
    onConfirmDelete,
  };
};

export default useProjectList;
