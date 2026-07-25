"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. Default 5s. Pass 0 to keep until dismissed. */
  durationMs?: number;
  variant?: "error" | "success";
};

/** Fixed bottom toast — used for transient auth / form feedback. */
const Toast = ({
  message,
  onDismiss,
  durationMs = 5000,
  variant = "error",
}: ToastProps) => {
  useEffect(() => {
    if (durationMs <= 0) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onDismiss, message]);

  const shell =
    variant === "success"
      ? "border-border bg-surface text-text"
      : "border-[#E8545440] bg-error-surface text-red";
  const dismiss =
    variant === "success"
      ? "text-muted hover:text-text"
      : "text-red/70 hover:text-red";

  return (
    <div
      role="alert"
      className="pointer-events-auto fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
    >
      <div
        className={`flex max-w-sm items-start gap-3 rounded-xl border px-3.5 py-3 text-sm shadow-[0_8px_28px_rgba(26,26,26,0.14)] ${shell}`}
      >
        <p className="min-w-0 flex-1 leading-snug">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={`shrink-0 ${dismiss}`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
