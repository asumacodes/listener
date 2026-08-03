"use client";

import ProjectPickerBody from "@/components/projects/ProjectPickerBody";
import { IconChevron } from "@/components/icons/ListenerIcons";
import type { ProjectColor } from "@/lib/palette";
import type { ProjectWithCount } from "@/lib/projects";
import { useEffect, useId, useRef } from "react";

type DesktopProjectPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  /** Optional color swatch on the trigger (idea header). */
  dotColor?: string;
  projects: ProjectWithCount[];
  selectedId: string | null;
  isSaving?: boolean;
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  startInCreate?: boolean;
  /**
   * `chip` — compact idea-header pill.
   * `field` — capture-modal footer control (taller, no uppercase tracking).
   */
  variant?: "chip" | "field";
};

/**
 * Desktop project assign — chip + anchored popover (not a mobile bottom sheet).
 * List UI lives in shared ProjectPickerBody.
 */
const DesktopProjectPicker = ({
  open,
  onOpenChange,
  label,
  dotColor,
  projects,
  selectedId,
  isSaving = false,
  onSelect,
  onCreateAndAssign,
  startInCreate = false,
  variant = "chip",
}: DesktopProjectPickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const triggerClass =
    variant === "field"
      ? "inline-flex h-10 max-w-[220px] items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm text-text-secondary transition hover:border-gold/40 hover:text-text disabled:opacity-60"
      : "inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-text-secondary transition hover:border-gold/40 hover:text-text disabled:opacity-60";

  return (
    // Reset inherited uppercase/tracking from idea-header meta row.
    <div ref={rootRef} className="relative normal-case tracking-normal">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        disabled={isSaving}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Project: ${label}. Change project`}
        className={triggerClass}
      >
        {dotColor ? (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/[0.06]"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
        ) : null}
        <span className="min-w-0 truncate">{label}</span>
        <IconChevron
          size={variant === "field" ? 14 : 12}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ProjectPickerBody
          density="popover"
          listId={listId}
          projects={projects}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateAndAssign={onCreateAndAssign}
          onClose={() => onOpenChange(false)}
          startInCreate={startInCreate}
        />
      ) : null}
    </div>
  );
};

export default DesktopProjectPicker;
