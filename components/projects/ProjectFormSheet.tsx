"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import { PROJECT_COLORS, type ProjectColor } from "@/lib/palette";
import type { ProjectFormMode } from "@/types/project";
import { useState } from "react";

type ProjectFormSheetProps = {
  open: boolean;
  mode: ProjectFormMode;
  resetKey: string;
  onClose: () => void;
  onSubmit: (name: string, color: ProjectColor) => Promise<void>;
  onDelete?: () => void;
};

type ProjectFormFieldsProps = {
  mode: ProjectFormMode;
  onClose: () => void;
  onSubmit: (name: string, color: ProjectColor) => Promise<void>;
  onDelete?: () => void;
};

const ProjectFormFields = ({
  mode,
  onClose,
  onSubmit,
  onDelete,
}: ProjectFormFieldsProps) => {
  const dismiss = useBottomSheetClose();
  const isEdit = mode.kind === "edit";
  const [name, setName] = useState(isEdit ? mode.initialName : "");
  const [color, setColor] = useState<ProjectColor>(
    isEdit ? mode.initialColor : "gold"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = isEdit ? "Edit project" : "New project";
  const caption =
    mode.kind === "create" && mode.context === "transcription"
      ? "Your recording will be saved here."
      : null;
  const submitLabel = isEdit
    ? "Save changes"
    : mode.kind === "create" && mode.context === "transcription"
      ? "Create & save here"
      : "Create";

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(name.trim(), color);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2 className="font-serif text-2xl text-text">{heading}</h2>
      {caption && <p className="mt-1 text-sm text-text-secondary">{caption}</p>}

      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        maxLength={60}
        className="mt-5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-gold"
      />

      <p className="mt-5 text-xs tracking-wide text-muted uppercase">Colour</p>
      <div className="mt-2 flex gap-3">
        {PROJECT_COLORS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setColor(c.key)}
            aria-label={c.label}
            className={`h-7 w-7 rounded-full ring-2 ring-offset-2 transition ${
              color === c.key ? "ring-text" : "ring-transparent"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-xs text-red">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={busy || !name.trim()}
        className="mt-6 w-full rounded-xl bg-gold py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "…" : submitLabel}
      </button>

      <button
        type="button"
        onClick={() => {
          if (!busy) dismiss();
        }}
        disabled={busy}
        className="mt-3 w-full py-2 text-center text-sm text-muted disabled:opacity-50"
      >
        Cancel
      </button>

      {isEdit && onDelete && (
        <>
          <div className="my-4 h-px bg-border" />
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="w-full text-center text-sm text-red disabled:opacity-50"
          >
            Delete project
          </button>
        </>
      )}
    </>
  );
};

const ProjectFormSheet = ({
  open,
  mode,
  resetKey,
  onClose,
  onSubmit,
  onDelete,
}: ProjectFormSheetProps) => (
  <BottomSheet open={open} onClose={onClose}>
    <ProjectFormFields
      key={resetKey}
      mode={mode}
      onClose={onClose}
      onSubmit={onSubmit}
      onDelete={onDelete}
    />
  </BottomSheet>
);

export default ProjectFormSheet;
