"use client";

import DismissSheet from "@/components/confirm/DismissSheet";
import { copy } from "@/lib/design/copy";

type OutOfQuotaSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Shown when fresh kickoff/rerun is blocked by free-tier balance (402).
 * Dismiss-only — paid plans are not shipped yet (KAN-54 Phase 5).
 */
const OutOfQuotaSheet = ({ open, onClose }: OutOfQuotaSheetProps) => (
  <DismissSheet
    open={open}
    onClose={onClose}
    title={copy.outOfQuota.title}
    body={copy.outOfQuota.body}
    dismissLabel={copy.outOfQuota.dismiss}
    titleId="out-of-quota-sheet-title"
  />
);

export default OutOfQuotaSheet;
