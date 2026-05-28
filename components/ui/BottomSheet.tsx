"use client";

import { ReactNode, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

const SHEET_DURATION_MS = 300;

type SheetPhase = "closed" | "entering" | "open" | "leaving";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** When true, backdrop click and Escape are ignored */
  lockDismiss?: boolean;
  labelledBy?: string;
};

const BottomSheet = ({
  open,
  onClose,
  children,
  lockDismiss = false,
  labelledBy,
}: BottomSheetProps) => {
  const fallbackTitleId = useId();
  const titleId = labelledBy ?? fallbackTitleId;
  const [phase, setPhase] = useState<SheetPhase>("closed");

  useEffect(() => {
    if (open) {
      let enterFrame = 0;
      let openFrame = 0;
      enterFrame = requestAnimationFrame(() => {
        setPhase((current) => (current === "closed" ? "entering" : current));
        openFrame = requestAnimationFrame(() => setPhase("open"));
      });
      return () => {
        cancelAnimationFrame(enterFrame);
        cancelAnimationFrame(openFrame);
      };
    }

    let leaveFrame = 0;
    leaveFrame = requestAnimationFrame(() => setPhase("leaving"));
    const timer = window.setTimeout(
      () => setPhase("closed"),
      SHEET_DURATION_MS
    );
    return () => {
      cancelAnimationFrame(leaveFrame);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (phase === "closed" || lockDismiss) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [phase, lockDismiss, onClose]);

  useEffect(() => {
    if (phase === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const mounted = phase !== "closed";
  const visible = phase === "open";

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => {
          if (!lockDismiss) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative rounded-t-3xl bg-card-white px-6 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {!labelledBy && (
          <div id={fallbackTitleId} className="sr-only">
            Dialog
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;
