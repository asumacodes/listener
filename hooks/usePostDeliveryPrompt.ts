"use client";

import { copy } from "@/lib/design/copy";
import {
  getPostDeliveryState,
  recordPostDeliveryReaction,
  updatePostDeliveryNote,
} from "@/lib/feedback-prompts/postDelivery";
import type { FeedbackReaction } from "@/types/feedback-prompts";
import { useCallback, useEffect, useState } from "react";

type UsePostDeliveryPromptArgs = {
  runId: string | null | undefined;
  ready: boolean;
};

const usePostDeliveryPrompt = ({ runId, ready }: UsePostDeliveryPromptArgs) => {
  const [show, setShow] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [phase, setPhase] = useState<"reaction" | "note">("reaction");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeKey = ready && runId ? runId : null;
  const [appliedKey, setAppliedKey] = useState(scopeKey);
  if (appliedKey !== scopeKey) {
    setAppliedKey(scopeKey);
    setShow(false);
    setResolved(false);
    setPhase("reaction");
    setError(null);
  }

  useEffect(() => {
    if (!ready || !runId) return;

    let cancelled = false;
    void getPostDeliveryState(runId).then((state) => {
      if (cancelled) return;
      setPhase("reaction");
      setShow(!state.exists);
      setResolved(true);
    });

    return () => {
      cancelled = true;
    };
  }, [ready, runId]);

  const react = useCallback(
    async (reaction: FeedbackReaction) => {
      if (!runId || busy) return;
      setBusy(true);
      setError(null);
      const id = await recordPostDeliveryReaction({ runId, reaction });
      setBusy(false);
      if (!id) {
        setError(copy.postDelivery.error);
        return;
      }
      if (reaction === "up") {
        setPhase("note");
        return;
      }
      setShow(false);
    },
    [busy, runId]
  );

  const submitNote = useCallback(
    async (note: string) => {
      if (!runId || busy) return;
      setBusy(true);
      setError(null);
      const id = await updatePostDeliveryNote({ runId, note });
      setBusy(false);
      if (!id) {
        setError(copy.postDelivery.error);
        return;
      }
      setShow(false);
    },
    [busy, runId]
  );

  const skipNote = useCallback(() => {
    setShow(false);
  }, []);

  const dismiss = useCallback(async () => {
    if (!runId || busy) return;
    setBusy(true);
    setError(null);
    const id = await recordPostDeliveryReaction({
      runId,
      dismissed: true,
    });
    setBusy(false);
    if (!id) {
      setError(copy.postDelivery.error);
      return;
    }
    setShow(false);
  }, [busy, runId]);

  return {
    show,
    resolved,
    phase,
    busy,
    error,
    react,
    submitNote,
    skipNote,
    dismiss,
  };
};

export default usePostDeliveryPrompt;
