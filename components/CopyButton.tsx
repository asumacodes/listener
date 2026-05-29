"use client";

import Button from "@/components/ui/Button";
import { useCallback, useState } from "react";

type CopyButtonProps = {
  text: string;
};

const CopyButton = ({ text }: CopyButtonProps) => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus("Copy failed");
    }
  }, [text]);

  return (
    <Button variant="secondary" fullWidth onClick={handleCopy}>
      {copyStatus ?? "Copy"}
    </Button>
  );
};

export default CopyButton;
