"use client";

import type { ProjectDeleteTarget } from "@/types/project";

type DeleteProjectSheetProps = {
  target: ProjectDeleteTarget;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const DeleteProjectSheet = ({
  target,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteProjectSheetProps) => {
  const { name, recordingCount } = target;
  const subtitle =
    recordingCount > 0
      ? `Its ${recordingCount} recording${recordingCount === 1 ? "" : "s"} will move to Uncategorised.`
      : "This cannot be undone.";

  return (
    <>
      <h2
        id="delete-project-title"
        className="font-serif text-2xl text-text-primary"
      >
        Delete &lsquo;{name}&rsquo;?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {subtitle}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 rounded-xl border border-black/10 bg-white py-3 text-sm font-medium text-text-primary transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 rounded-xl bg-recording-red py-3 text-sm font-medium text-white transition disabled:opacity-50"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </>
  );
};

export default DeleteProjectSheet;
