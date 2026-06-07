import ConfirmSheet from "@/components/ui/ConfirmSheet";

type DeleteProjectSheetProps = {
  open: boolean;
  ideaCount?: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const DeleteProjectSheet = ({
  open,
  ideaCount = 0,
  busy = false,
  onClose,
  onConfirm,
}: DeleteProjectSheetProps) => (
  <ConfirmSheet
    open={open}
    title="Delete this project?"
    body={`The ${ideaCount} idea${ideaCount === 1 ? "" : "s"} inside will move to Uncategorised — they won't be deleted.`}
    confirmLabel="Delete project"
    busy={busy}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);

export default DeleteProjectSheet;
