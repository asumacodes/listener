import ConfirmSheet from "@/components/ui/ConfirmSheet";

type DeleteRecordingSheetProps = {
  open: boolean;
  runCount?: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const DeleteRecordingSheet = ({
  open,
  runCount = 0,
  busy = false,
  onClose,
  onConfirm,
}: DeleteRecordingSheetProps) => (
  <ConfirmSheet
    open={open}
    title="Delete this recording?"
    body={
      runCount > 0
        ? `This deletes the recording, its transcription, and ${runCount === 1 ? "its generated result" : `all ${runCount} generated results`}. This can't be undone.`
        : "This deletes the recording and its transcription. This can't be undone."
    }
    confirmLabel="Delete recording"
    cancelLabel="Keep it"
    busy={busy}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);

export default DeleteRecordingSheet;
