import ConfirmSheet from "@/components/ui/ConfirmSheet";

type DeleteRecordingSheetProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const DeleteRecordingSheet = ({
  open,
  busy = false,
  onClose,
  onConfirm,
}: DeleteRecordingSheetProps) => (
  <ConfirmSheet
    open={open}
    title="Delete this recording?"
    body="This removes the audio. Any generated results stay."
    confirmLabel="Delete recording"
    cancelLabel="Keep it"
    busy={busy}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);

export default DeleteRecordingSheet;
