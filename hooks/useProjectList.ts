"use client";

import type { ProjectColor } from "@/lib/palette";
import { createProject, deleteProject, updateProject } from "@/lib/projects";
import type { ProjectWithRollup } from "@/lib/projects/rollup";
import { projectsQueryKey, useProjectsQuery } from "@/hooks/useProjectsQuery";
import type {
  ProjectDeleteTarget,
  ProjectFormMode,
  ProjectListFormState,
  ProjectListViewProps,
} from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

const LIST_CREATE_MODE: ProjectFormMode = {
  kind: "create",
  context: "list",
};

const useProjectList = (): ProjectListViewProps => {
  const queryClient = useQueryClient();
  const projectsQuery = useProjectsQuery();
  const projects = projectsQuery.data ?? [];
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectListFormState>({ kind: "closed" });
  const [lastFormMode, setLastFormMode] =
    useState<ProjectFormMode>(LIST_CREATE_MODE);
  const [deleteTarget, setDeleteTarget] = useState<ProjectDeleteTarget | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
  }, [queryClient]);

  const onOpenCreate = useCallback(() => {
    setLastFormMode(LIST_CREATE_MODE);
    setForm({ kind: "create" });
  }, []);

  const onCloseForm = useCallback(() => setForm({ kind: "closed" }), []);

  const onOpenEdit = useCallback((project: ProjectWithRollup) => {
    setLastFormMode({
      kind: "edit",
      initialName: project.name,
      initialColor: project.color as ProjectColor,
    });
    setForm({ kind: "edit", project });
  }, []);

  const onSubmitForm = useCallback(
    async (name: string, color: ProjectColor) => {
      setActionError(null);
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
    setActionError(null);
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to delete");
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
          initialColor: form.project.color as ProjectColor,
        }
      : form.kind === "create"
        ? LIST_CREATE_MODE
        : lastFormMode;
  const formResetKey =
    form.kind === "edit" ? `edit-${form.project.id}` : "create-list";

  return {
    projects,
    loading: projectsQuery.isPending,
    error:
      actionError ??
      (projectsQuery.error instanceof Error
        ? projectsQuery.error.message
        : null),
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
