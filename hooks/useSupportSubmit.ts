"use client";

import type { SupportStatus } from "@/components/support/SupportComposerBody";
import { postSupportTicket } from "@/lib/support/client";
import type { SupportSubmitPayload } from "@/lib/support/client";
import { useState } from "react";

export const useSupportSubmit = () => {
  const [status, setStatus] = useState<SupportStatus>("idle");

  const submit = async (payload: SupportSubmitPayload) => {
    setStatus("submitting");
    try {
      const result = await postSupportTicket(payload);
      setStatus(result.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return { status, submit, reset: () => setStatus("idle") };
};
