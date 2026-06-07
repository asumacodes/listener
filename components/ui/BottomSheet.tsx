"use client";

import {
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const SHEET_MS = 280;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

const BottomSheetCloseContext = createContext<(() => void) | null>(null);

/** Triggers the sheet exit animation, then calls `onClose` after it finishes. */
export const useBottomSheetClose = () => {
  const dismiss = useContext(BottomSheetCloseContext);
  if (!dismiss) {
    throw new Error("useBottomSheetClose must be used inside BottomSheet");
  }
  return dismiss;
};

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** When true, backdrop / escape dismiss is ignored */
  lockDismiss?: boolean;
};

const sheetTransform = (visible: boolean, dragOffset: number | null) => {
  if (dragOffset !== null) return `translateY(${dragOffset}px)`;
  return visible ? "translateY(0)" : "translateY(100%)";
};

const BottomSheet = ({
  open,
  onClose,
  children,
  lockDismiss = false,
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const closingRef = useRef(false);
  const prevOpenRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const lockDismissRef = useRef(lockDismiss);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
    lockDismissRef.current = lockDismiss;
  });

  const runEnter = useCallback(() => {
    closingRef.current = false;
    setDragOffset(null);
    setVisible(false);
    setMounted(true);

    requestAnimationFrame(() => {
      sheetRef.current?.getBoundingClientRect();
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const runExit = useCallback((notifyParent: boolean) => {
    if (closingRef.current) return;
    if (notifyParent && lockDismissRef.current) return;

    closingRef.current = true;
    setDragOffset(null);
    setVisible(false);

    window.setTimeout(() => {
      setMounted(false);
      closingRef.current = false;
      if (notifyParent) onCloseRef.current();
    }, SHEET_MS);
  }, []);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open && !wasOpen) {
      runEnter();
      return;
    }

    if (!open && wasOpen && mounted) {
      runExit(false);
    }
  }, [open, mounted, runEnter, runExit]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") runExit(true);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, runExit]);

  useEffect(() => {
    if (visible) sheetRef.current?.focus();
  }, [visible]);

  if (!mounted || typeof document === "undefined") return null;

  const isDragging = dragOffset !== null;
  const sheetTransition = isDragging
    ? "none"
    : `transform ${SHEET_MS}ms ${SHEET_EASE}`;

  const sheetStyle: CSSProperties = {
    transform: sheetTransform(visible, dragOffset),
    transition: sheetTransition,
  };

  const scrimStyle: CSSProperties = {
    background: "var(--scrim)",
    opacity: visible ? 1 : 0,
    transition: `opacity ${SHEET_MS}ms ${SHEET_EASE}`,
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragOffset(null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragOffset(delta);
  };

  const onTouchEnd = () => {
    if (dragOffset !== null && dragOffset > 100) {
      setDragOffset(null);
      runExit(true);
    } else {
      setDragOffset(null);
    }
    startY.current = null;
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default motion-reduce:transition-none"
        style={scrimStyle}
        onClick={() => runExit(true)}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="absolute inset-x-0 bottom-0 w-full rounded-t-3xl bg-surface px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] outline-none motion-reduce:transition-none"
        style={sheetStyle}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <BottomSheetCloseContext.Provider value={() => runExit(true)}>
          {children}
        </BottomSheetCloseContext.Provider>
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;
