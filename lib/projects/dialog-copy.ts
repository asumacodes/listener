import type { ProjectDeleteTarget } from "@/types/project";

export const getDeleteDialogCopy = (target: ProjectDeleteTarget) => {
  if (target.recordingCount > 0) {
    return {
      title: "Delete project?",
      body: `"${target.name}" and its ${target.recordingCount} recording${target.recordingCount === 1 ? "" : "s"} will be moved to Uncategorised. This can't be undone.`,
    };
  }
  return {
    title: `Delete "${target.name}"?`,
    body: undefined as string | undefined,
  };
};
