"use client";

import { IconMore } from "@/components/icons/ListenerIcons";
import { useEffect, useId, useRef, useState } from "react";

type DesktopIdeaOverflowMenuProps = {
  onRunAgain: () => void;
  onMoveToProject: () => void;
  onDeleteIdea: () => void;
  runAgainBusy?: boolean;
  runAgainDisabled?: boolean;
};

/**
 * Completed-run overflow — primary use is Download; costly / destructive
 * actions live here. Failed recovery stays outside this menu.
 */
const DesktopIdeaOverflowMenu = ({
  onRunAgain,
  onMoveToProject,
  onDeleteIdea,
  runAgainBusy = false,
  runAgainDisabled = false,
}: DesktopIdeaOverflowMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeAnd = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-surface text-gold transition hover:bg-gold-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-30)]"
      >
        <IconMore size={18} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-[280px] rounded-2xl border border-border bg-surface py-1.5 shadow-[0_16px_40px_rgba(26,26,26,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            disabled={runAgainBusy || runAgainDisabled}
            onClick={() => closeAnd(onRunAgain)}
            className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition hover:bg-canvas disabled:opacity-50"
          >
            <span className="text-[14px] font-medium text-text">
              Run again
              <span className="font-normal text-muted"> (uses 1 idea)</span>
            </span>
            <span className="text-[12px] leading-snug text-muted">
              {runAgainDisabled
                ? "You've used your free idea"
                : "About 6 minutes · replaces these artifacts"}
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            disabled
            title="Rename is coming soon"
            className="flex w-full px-4 py-2.5 text-left text-[14px] text-muted"
          >
            Rename idea
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => closeAnd(onMoveToProject)}
            className="flex w-full px-4 py-2.5 text-left text-[14px] text-text transition hover:bg-canvas"
          >
            Move to project…
          </button>

          <div role="separator" className="my-1.5 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => closeAnd(onDeleteIdea)}
            className="flex w-full px-4 py-2.5 text-left text-[14px] text-red transition hover:bg-error-surface"
          >
            Delete idea
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DesktopIdeaOverflowMenu;
