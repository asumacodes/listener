"use client";

import ConfirmSheet from "@/components/ui/ConfirmSheet";
import Input from "@/components/ui/Input";
import { useState } from "react";

type DeleteAccountSheetProps = {
  open: boolean;
  email: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const DeleteAccountSheet = ({
  open,
  email,
  busy = false,
  onClose,
  onConfirm,
}: DeleteAccountSheetProps) => {
  const [value, setValue] = useState("");
  const match = value.trim().toLowerCase() === email.trim().toLowerCase();

  return (
    <ConfirmSheet
      open={open}
      title="Delete your account?"
      body="This permanently deletes your account, all recordings, and all results. This can't be undone."
      confirmLabel="Delete account"
      confirmDisabled={!match}
      note="Your Jira and Confluence content is not affected."
      busy={busy}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your email to confirm"
        autoComplete="off"
        className="mt-4"
      />
    </ConfirmSheet>
  );
};

export default DeleteAccountSheet;
