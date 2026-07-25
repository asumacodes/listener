"use client";

import DismissSheet from "@/components/confirm/DismissSheet";
import { copy } from "@/lib/design/copy";

type CostHaltSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Shown when fresh kickoff is blocked by free-tier daily cost ceiling (503).
 * Distinct from out_of_quota — the user still has their free idea.
 */
const CostHaltSheet = ({ open, onClose }: CostHaltSheetProps) => (
  <DismissSheet
    open={open}
    onClose={onClose}
    title={copy.costHalt.title}
    body={copy.costHalt.body}
    dismissLabel={copy.costHalt.dismiss}
    titleId="cost-halt-sheet-title"
  />
);

export default CostHaltSheet;
