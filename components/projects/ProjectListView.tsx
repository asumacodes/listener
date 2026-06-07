"use client";

import ProjectCard from "@/components/cards/ProjectCard";
import DashedAdd from "@/components/cards/DashedAdd";
import DeleteProjectSheet from "@/components/confirm/DeleteProjectSheet";
import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import { PencilIcon } from "@/components/icons/ActionIcons";
import { colorHex } from "@/lib/palette";
import type { ProjectListViewProps } from "@/types/project";

const ProjectListView = ({
  projects,
  loading,
  error,
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
}: ProjectListViewProps) => {
  if (loading) return <p className="mt-8 text-sm text-muted">Loading…</p>;

  return (
    <>
      <div className="mt-6 space-y-3">
        <DashedAdd label="New project" onClick={onOpenCreate} />

        {error ? <p className="text-xs text-red">{error}</p> : null}

        <ul className="space-y-3">
          {projects.map((p) => {
            const badge =
              p.rollup.attentionCount > 0
                ? ("attention" as const)
                : p.rollup.runningCount > 0
                  ? ("running" as const)
                  : null;
            return (
              <li key={p.id} className="relative">
                <ProjectCard
                  href={`/projects/${p.id}`}
                  name={p.name}
                  line={`${p.recording_count} idea${p.recording_count === 1 ? "" : "s"}`}
                  dotColor={colorHex(p.color)}
                  badge={badge}
                />
                {!p.is_default ? (
                  <button
                    type="button"
                    onClick={() => onOpenEdit(p)}
                    aria-label={`Edit ${p.name}`}
                    className="absolute top-1/2 right-14 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text"
                  >
                    <PencilIcon />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <ProjectFormSheet
        open={formOpen}
        resetKey={formResetKey}
        mode={formMode}
        onClose={onCloseForm}
        onSubmit={onSubmitForm}
        onDelete={formOpen ? onRequestDeleteFromEdit : undefined}
      />

      <DeleteProjectSheet
        open={deleteTarget !== null}
        ideaCount={deleteTarget?.recordingCount ?? 0}
        busy={isDeleting}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default ProjectListView;
