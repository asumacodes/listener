"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. Default 5s. Pass 0 to keep until dismissed. */
  durationMs?: number;
  variant?: "error" | "success";
};

/** Fixed top-right toast — clears the tab bar and primary CTAs. */
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
      : "border-red/25 bg-error-surface text-red";
  const dismiss =
    variant === "success"
      ? "text-muted hover:text-text"
      : "text-red/70 hover:text-red";

  return (
    <div
      role="alert"
      className="pointer-events-auto fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-50 w-[min(22rem,calc(100vw-2rem))]"
    >
      <div
        className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm shadow-toast ${shell}`}
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
