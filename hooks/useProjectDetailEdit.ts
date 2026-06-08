"use client";

import { deleteProject, updateProject } from "@/lib/projects";
import type { ProjectColor } from "@/lib/palette";
import type { ProjectDetailHeader } from "@/types/project";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const useProjectDetailEdit = (
  project: ProjectDetailHeader,
  recordingCount: number
) => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formMode = {
    kind: "edit" as const,
    initialName: project.name,
    initialColor: project.color as ProjectColor,
  };

  const onOpenEdit = useCallback(() => setFormOpen(true), []);
  const onCloseForm = useCallback(() => setFormOpen(false), []);

  const onSubmitForm = useCallback(
    async (name: string, color: ProjectColor) => {
      await updateProject(project.id, name, color);
      setFormOpen(false);
      router.refresh();
    },
    [project.id, router]
  );

  const onRequestDeleteFromEdit = useCallback(() => {
    setFormOpen(false);
    setDeleteOpen(true);
  }, []);

  const onCancelDelete = useCallback(() => {
    if (!isDeleting) setDeleteOpen(false);
  }, [isDeleting]);

  const onConfirmDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      router.push("/projects");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }, [project.id, isDeleting, router]);

  return {
    formOpen,
    formMode,
    formResetKey: `edit-${project.id}`,
    deleteOpen,
    isDeleting,
    recordingCount,
    onOpenEdit,
    onCloseForm,
    onSubmitForm,
    onRequestDeleteFromEdit: project.is_default
      ? undefined
      : onRequestDeleteFromEdit,
    onCancelDelete,
    onConfirmDelete,
  };
};

export default useProjectDetailEdit;
