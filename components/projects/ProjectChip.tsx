"use client";

import { IconChevron } from "@/components/icons/ListenerIcons";
import ProjectSheet from "@/components/projects/ProjectSheet";
import { colorHex } from "@/lib/palette";
import type { ProjectPickerViewProps } from "@/types/project";
import { useMemo, useState } from "react";

type ProjectChipProps = Pick<
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
  sheetOpen?: boolean;
  onSheetOpenChange?: (open: boolean) => void;
};

/** Mockup `.proj-chip` — compact project assign on idea detail. */
const ProjectChip = ({
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
  sheetOpen,
  onSheetOpenChange,
}: ProjectChipProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = sheetOpen ?? internalOpen;
  const setOpen = onSheetOpenChange ?? setInternalOpen;
  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId]
  );

  const label = selected?.name ?? "Uncategorised";
  const dotColor = selected ? colorHex(selected.color) : "#D8D5CE";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isSaving}
        className="self-start inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-left transition active:scale-[0.99] disabled:opacity-60"
      >
        <span
          className="h-5 w-5 shrink-0 rounded-full border border-black/[0.06]"
          style={{ backgroundColor: dotColor }}
          aria-hidden
        />
        <span className="min-w-0 truncate text-sm text-text">{label}</span>
        <IconChevron size={14} className="shrink-0 text-muted" />
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

export default ProjectChip;
