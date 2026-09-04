"use client";

import type { FeedbackStatus } from "@/components/feedback/FeedbackComposerBody";
import { postFeedback } from "@/lib/feedback/client";
import type { FeedbackSubmitPayload } from "@/lib/feedback/client";
import { useState } from "react";

export const useFeedbackSubmit = () => {
  const [status, setStatus] = useState<FeedbackStatus>("idle");

  const submit = async (payload: FeedbackSubmitPayload) => {
    setStatus("submitting");
    try {
      const result = await postFeedback(payload);
      setStatus(result.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return { status, submit, reset: () => setStatus("idle") };
};
