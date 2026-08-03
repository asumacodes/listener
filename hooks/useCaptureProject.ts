"use client";

import useProjectSelection, {
  type ProjectSelection,
} from "@/hooks/useProjectSelection";

export type CaptureProjectPicker = Pick<
  ProjectSelection,
  "projects" | "selectedId" | "label" | "onSelect" | "reset"
> & {
  onCreateAndSelect: ProjectSelection["onCreateAndSelect"];
};

/**
 * Pre-save project selection for capture. Thin wrapper over shared selection.
 */
const useCaptureProject = (enabled: boolean): CaptureProjectPicker => {
  const selection = useProjectSelection({ enabled });
  return {
    projects: selection.projects,
    selectedId: selection.selectedId,
    label: selection.label,
    onSelect: selection.onSelect,
    onCreateAndSelect: selection.onCreateAndSelect,
    reset: selection.reset,
  };
};

export default useCaptureProject;
