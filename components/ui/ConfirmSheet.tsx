"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import type { ReactNode } from "react";

type ConfirmSheetProps = {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  note?: string;
  busy?: boolean;
  children?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

const ConfirmSheetActions = ({
  busy,
  confirmDisabled,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: {
  busy: boolean;
  confirmDisabled: boolean;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
}) => {
  const dismiss = useBottomSheetClose();

  return (
    <div className="mt-6 flex flex-col gap-3">
      <Button
        variant="danger"
        fullWidth
        disabled={busy || confirmDisabled}
        onClick={() => void onConfirm()}
      >
        {busy ? "Deleting…" : confirmLabel}
      </Button>
      <Button
        variant="ghost"
        fullWidth
        disabled={busy}
        onClick={() => {
          if (!busy) dismiss();
        }}
      >
        {cancelLabel}
      </Button>
    </div>
  );
};

const ConfirmSheet = ({
  open,
  title,
  body,
  confirmLabel = "Delete",
  cancelLabel = "Keep it",
  confirmDisabled = false,
  note,
  busy = false,
  children,
  onConfirm,
  onClose,
}: ConfirmSheetProps) => (
  <BottomSheet open={open} onClose={onClose} lockDismiss={busy}>
    <div role="alertdialog" aria-labelledby="confirm-sheet-title">
      <div
        className="cs-handle mx-auto mb-3 h-1 w-10 rounded-full bg-border"
        aria-hidden
      />
      <h2
        id="confirm-sheet-title"
        className="font-serif text-2xl leading-tight text-text"
      >
        {title}
      </h2>
      {body ? (
        <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
          {body}
        </p>
      ) : null}
      {children}
      {note ? (
        <p className="cs-note mt-3 text-xs leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
      <ConfirmSheetActions
        busy={busy}
        confirmDisabled={confirmDisabled}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={onConfirm}
      />
    </div>
  </BottomSheet>
);

export default ConfirmSheet;
