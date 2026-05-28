"use client";

import DeleteProjectSheet from "@/components/projects/DeleteProjectSheet";
import BottomSheet from "@/components/ui/BottomSheet";
import { PROJECT_COLORS, colorHex } from "@/lib/palette";
import type { ProjectListViewProps } from "@/types/project";
import Link from "next/link";

const ProjectListView = ({
  projects,
  loading,
  error,
  newName,
  newColor,
  creating,
  deleteTarget,
  isDeleting,
  onNewNameChange,
  onNewColorChange,
  onCreate,
  onRename,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: ProjectListViewProps) => {
  if (loading) return <p className="mt-8 text-sm text-text-muted">Loading…</p>;

  return (
    <>
      <div className="mt-8">
        <div className="rounded-2xl border border-black/10 bg-card-white p-4">
          <input
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="New project name"
            maxLength={60}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onNewColorChange(c.key)}
                  aria-label={c.label}
                  className={`h-6 w-6 rounded-full ring-2 ring-offset-2 transition ${
                    newColor === c.key
                      ? "ring-text-primary"
                      : "ring-transparent"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onCreate}
              disabled={creating || !newName.trim()}
              className="rounded-lg bg-gold-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-recording-red">{error}</p>}

        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-black/10 bg-card-white p-4"
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
                <span className="font-serif text-lg text-text-primary">
                  {p.name}
                </span>
                <span className="text-xs text-text-muted">
                  {p.recording_count}
                </span>
              </Link>
              {!p.is_default && (
                <div className="flex gap-3 text-xs text-text-muted">
                  <button type="button" onClick={() => onRename(p.id, p.name)}>
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onRequestDelete(p.id, p.name, p.recording_count)
                    }
                    className="text-recording-red"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <BottomSheet
        open={deleteTarget !== null}
        onClose={onCancelDelete}
        lockDismiss={isDeleting}
        labelledBy="delete-project-title"
      >
        {deleteTarget && (
          <DeleteProjectSheet
            target={deleteTarget}
            isDeleting={isDeleting}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
          />
        )}
      </BottomSheet>
    </>
  );
};

export default ProjectListView;
