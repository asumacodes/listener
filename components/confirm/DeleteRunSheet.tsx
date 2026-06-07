import ConfirmSheet from "@/components/ui/ConfirmSheet";

type DeleteRunSheetProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const DeleteRunSheet = ({
  open,
  busy = false,
  onClose,
  onConfirm,
}: DeleteRunSheetProps) => (
  <ConfirmSheet
    open={open}
    title="Delete this run?"
    body="This removes this run's results. The recording and other runs stay."
    confirmLabel="Delete run"
    cancelLabel="Keep it"
    busy={busy}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);

export default DeleteRunSheet;
