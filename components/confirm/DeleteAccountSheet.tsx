"use client";

import ConfirmSheet from "@/components/ui/ConfirmSheet";
import Input from "@/components/ui/Input";
import { useState } from "react";

const DELETE_CONFIRM_PHRASE = "DELETE";

type DeleteAccountSheetProps = {
  open: boolean;
  /** When present, confirm by typing email; otherwise type DELETE. */
  email: string | null;
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
  const expected = email?.trim()
    ? email.trim().toLowerCase()
    : DELETE_CONFIRM_PHRASE;
  const match = value.trim().toLowerCase() === expected.toLowerCase();
  const placeholder = email
    ? "Type your email to confirm"
    : `Type ${DELETE_CONFIRM_PHRASE} to confirm`;

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
        placeholder={placeholder}
        autoComplete="off"
        className="mt-4"
      />
    </ConfirmSheet>
  );
};

export default DeleteAccountSheet;
