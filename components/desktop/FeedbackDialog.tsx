"use client";

import { useFeedbackDialog } from "@/components/desktop/FeedbackDialogContext";
import FeedbackComposerBody from "@/components/feedback/FeedbackComposerBody";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

const FeedbackDialog = () => {
  const { open, closeFeedback } = useFeedbackDialog();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 cursor-default bg-[var(--scrim)]"
        onClick={closeFeedback}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(440px,calc(100vw-2rem))] rounded-3xl border border-border bg-surface px-[34px] pt-9 pb-[30px] shadow-[0_24px_80px_rgba(26,26,26,0.22)]"
      >
        <button
          type="button"
          onClick={closeFeedback}
          aria-label="Close"
          className="absolute top-[18px] right-5 text-[15px] text-muted transition hover:text-text"
        >
          ×
        </button>
        <FeedbackComposerBody
          titleId="feedback-dialog-title"
          onCancel={closeFeedback}
        />
      </div>
    </div>,
    document.body
  );
};

export default FeedbackDialog;
