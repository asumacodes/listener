"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. Default 5s. Pass 0 to keep until dismissed. */
  durationMs?: number;
};

/** Fixed bottom toast — used for transient auth / form feedback. */
const Toast = ({ message, onDismiss, durationMs = 5000 }: ToastProps) => {
  useEffect(() => {
    if (durationMs <= 0) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onDismiss, message]);

  return (
    <div
      role="alert"
      className="pointer-events-auto fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
    >
      <div className="flex max-w-sm items-start gap-3 rounded-xl border border-[#E8545440] bg-error-surface px-3.5 py-3 text-sm text-red shadow-[0_8px_28px_rgba(26,26,26,0.14)]">
        <p className="min-w-0 flex-1 leading-snug">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-red/70 hover:text-red"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
