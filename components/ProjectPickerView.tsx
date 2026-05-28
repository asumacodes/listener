"use client";

import { colorHex } from "@/lib/palette";
import type { ProjectPickerViewProps } from "@/types/project";

const ProjectPickerView = ({
  projects,
  selectedId,
  isSaving,
  error,
  onSelect,
}: ProjectPickerViewProps) => (
  <div className="mt-4">
    <p className="text-xs tracking-wide text-text-muted uppercase">
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
                ? "border-transparent bg-text-primary text-white"
                : "border-black/10 bg-white text-text-secondary hover:bg-black/5"
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
    </div>
    {error && <p className="mt-2 text-xs text-recording-red">{error}</p>}
  </div>
);

export default ProjectPickerView;
