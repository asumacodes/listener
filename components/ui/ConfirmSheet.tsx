"use client";

import BottomSheet, { useBottomSheetClose } from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";

type ConfirmSheetProps = {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

const ConfirmSheetActions = ({
  busy,
  confirmLabel,
  onConfirm,
}: {
  busy: boolean;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
}) => {
  const dismiss = useBottomSheetClose();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="mt-6 flex gap-3">
      <Button
        variant="secondary"
        fullWidth
        disabled={busy}
        onClick={() => {
          if (!busy) dismiss();
        }}
      >
        Cancel
      </Button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={busy}
        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-red px-4 py-3 text-sm font-medium font-sans text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Deleting…" : confirmLabel}
      </button>
    </div>
  );
};

const ConfirmSheet = ({
  open,
  title,
  body,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onClose,
}: ConfirmSheetProps) => (
  <BottomSheet open={open} onClose={onClose} lockDismiss={busy}>
    <div role="alertdialog" aria-labelledby="confirm-sheet-title">
      <h2 id="confirm-sheet-title" className="font-serif text-2xl text-text">
        {title}
      </h2>
      {body ? (
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {body}
        </p>
      ) : null}
      <ConfirmSheetActions
        busy={busy}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
      />
    </div>
  </BottomSheet>
);

export default ConfirmSheet;
