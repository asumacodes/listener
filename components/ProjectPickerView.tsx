"use client";

import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import { colorHex } from "@/lib/palette";
import type { ProjectPickerViewProps } from "@/types/project";

const ProjectPickerView = ({
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
}: ProjectPickerViewProps) => (
  <div className="mt-4">
    <p className="text-xs tracking-wide text-muted uppercase">
      Save to project
    </p>
    <div className="mt-2 flex flex-wrap gap-2">
      {projects.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            disabled={isSaving}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-50 ${
              active
                ? "border-transparent bg-text text-white"
                : "border-border bg-surface text-text-secondary hover:bg-black/[0.03]"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorHex(p.color) }}
              aria-hidden
            />
            {p.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onOpenCreateSheet}
        disabled={isSaving}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-border bg-surface px-3 py-1.5 text-sm text-muted transition hover:text-text disabled:opacity-50"
      >
        + New project
      </button>
    </div>
    {savedTo && (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary animate-fade-in">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Saved to {savedTo}
      </p>
    )}
    {error && <p className="mt-2 text-xs text-red">{error}</p>}

    <ProjectFormSheet
      open={createSheetOpen}
      resetKey="create-transcription"
      mode={{ kind: "create", context: "transcription" }}
      onClose={onCloseCreateSheet}
      onSubmit={onCreateAndAssign}
    />
  </div>
);

export default ProjectPickerView;
