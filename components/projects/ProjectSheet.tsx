"use client";

import ProjectPickerBody from "@/components/projects/ProjectPickerBody";
import { ui } from "@/lib/design/ui";
import type { ProjectColor } from "@/lib/palette";
import type { ProjectWithCount } from "@/lib/projects";

type ProjectSheetProps = {
  open: boolean;
  onClose: () => void;
  projects: ProjectWithCount[];
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  initialCreate?: boolean;
  onOpenCreate?: () => void;
  suggestedName?: string | null;
  selectedId?: string | null;
  /** Override stage stacking — e.g. above capture modal (z-50). */
  className?: string;
};

/**
 * Mobile bottom-sheet shell around shared ProjectPickerBody.
 */
const ProjectSheet = ({
  open,
  onClose,
  projects,
  onSelect,
  onCreateAndAssign,
  initialCreate = false,
  suggestedName,
  selectedId = null,
  className = "",
}: ProjectSheetProps) => {
  if (!open) return null;

  return (
    <div
      className={`psheet-stage fixed inset-0 z-50 flex items-end justify-center ${className}`}
      onClick={onClose}
      role="presentation"
    >
      <div className="psheet-scrim absolute inset-0 bg-black/40" />
      <div
        className={`psheet relative z-10 max-h-[85dvh] w-full animate-sheet-up overflow-hidden ${ui.sheet} pb-[max(1rem,env(safe-area-inset-bottom))]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="project-sheet-title"
      >
        <div className="psheet-handle mx-auto mt-3 h-1 w-10 rounded-full bg-border" />
        <h2
          id="project-sheet-title"
          className="psheet-title px-5 pt-4 font-serif text-2xl text-text"
        >
          Add to a project
        </h2>
        <ProjectPickerBody
          key={initialCreate ? "create" : "browse"}
          density="sheet"
          projects={projects}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateAndAssign={onCreateAndAssign}
          onClose={onClose}
          startInCreate={initialCreate}
          suggestedName={suggestedName}
        />
      </div>
    </div>
  );
};

export default ProjectSheet;
