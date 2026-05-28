"use client";

import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import ConfirmSheet from "@/components/ui/ConfirmSheet";
import { colorHex } from "@/lib/palette";
import { getDeleteDialogCopy } from "@/lib/projects/dialog-copy";
import type { ProjectListViewProps } from "@/types/project";
import Link from "next/link";

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
  const deleteDialog = deleteTarget ? getDeleteDialogCopy(deleteTarget) : null;

  if (loading) return <p className="mt-8 text-sm text-muted">Loading…</p>;

  return (
    <>
      <div className="mt-8">
        <button
          type="button"
          onClick={onOpenCreate}
          className="w-full rounded-2xl border border-dashed border-border bg-surface px-4 py-3.5 text-sm text-muted transition hover:border-gold/50 hover:text-text"
        >
          + New project
        </button>

        {error && <p className="mt-4 text-xs text-red">{error}</p>}

        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <Link
                href={`/projects/${p.id}`}
                className="flex items-center gap-3"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: colorHex(p.color) }}
                  aria-hidden
                />
                <span className="font-serif text-lg text-text">{p.name}</span>
                <span className="text-xs text-muted">{p.recording_count}</span>
              </Link>
              {!p.is_default && (
                <button
                  type="button"
                  onClick={() => onOpenEdit(p)}
                  className="text-xs text-muted transition hover:text-text"
                >
                  Edit
                </button>
              )}
            </li>
          ))}
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

      <ConfirmSheet
        open={deleteTarget !== null}
        title={deleteDialog?.title ?? ""}
        body={deleteDialog?.body}
        busy={isDeleting}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default ProjectListView;
