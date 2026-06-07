"use client";

import { IconChevron, IconSearch } from "@/components/icons/ListenerIcons";
import ProjectSheet from "@/components/projects/ProjectSheet";
import { colorHex } from "@/lib/palette";
import { ui } from "@/lib/design/ui";
import type { ProjectPickerViewProps } from "@/types/project";
import { useMemo, useState } from "react";

type ProjectAssignRowProps = Pick<
  ProjectPickerViewProps,
  | "projects"
  | "selectedId"
  | "isSaving"
  | "error"
  | "savedTo"
  | "onSelect"
  | "createSheetOpen"
  | "onOpenCreateSheet"
  | "onCloseCreateSheet"
  | "onCreateAndAssign"
> & {
  suggestedName?: string | null;
};

const ProjectAssignRow = ({
  projects,
  selectedId,
  isSaving,
  error,
  savedTo,
  onSelect,
  createSheetOpen,
  onOpenCreateSheet,
  onCloseCreateSheet,
  onCreateAndAssign,
  suggestedName,
}: ProjectAssignRowProps) => {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId]
  );

  return (
    <>
      <button
        type="button"
        className="pa-cta mt-4 flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-card transition hover:border-gold/40 disabled:opacity-60"
        onClick={() => setOpen(true)}
        disabled={isSaving}
      >
        {selected ? (
          <>
            <span
              className="h-7 w-7 shrink-0 rounded-full border border-black/[0.06]"
              style={{ backgroundColor: colorHex(selected.color) }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className={`${ui.eyebrow} block text-[10px] text-muted`}>
                In project
              </span>
              <span className="block font-medium text-text">
                {selected.name}
              </span>
            </span>
            <span className="text-sm font-medium text-gold">Change</span>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-muted">
              <IconSearch size={20} className="opacity-0" aria-hidden />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M12 11v5M9.5 13.5h5" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-text">
                Add to a project
              </span>
              <span
                className={`${ui.eyebrow} mt-0.5 block text-[10px] normal-case tracking-normal text-muted`}
              >
                Keep this idea somewhere
              </span>
            </span>
            <IconChevron size={18} className="text-muted" />
          </>
        )}
      </button>

      {savedTo ? (
        <p className="mt-2 text-xs text-text-secondary">Saved to {savedTo}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red">{error}</p> : null}

      <ProjectSheet
        open={open || createSheetOpen}
        onClose={() => {
          setOpen(false);
          onCloseCreateSheet();
        }}
        projects={projects}
        onSelect={(id) => {
          void onSelect(id);
          setOpen(false);
        }}
        onCreateAndAssign={onCreateAndAssign}
        initialCreate={createSheetOpen}
        onOpenCreate={onOpenCreateSheet}
        suggestedName={suggestedName}
      />
    </>
  );
};

export default ProjectAssignRow;
