"use client";

import { copy } from "@/lib/design/copy";
import {
  getFrictionState,
  recordFrictionResponse,
} from "@/lib/feedback-prompts/friction";
import { useCallback, useEffect, useState } from "react";

type UseFrictionPromptArgs = {
  runId: string | null | undefined;
  ready: boolean;
  postDelivery: { show: boolean; resolved: boolean };
  shipOutcome: { show: boolean };
};

const useFrictionPrompt = ({
  runId,
  ready,
  postDelivery,
  shipOutcome,
}: UseFrictionPromptArgs) => {
  const [eligible, setEligible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready && (eligible || error)) {
    setEligible(false);
    setError(null);
  }

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    void getFrictionState().then((state) => {
      if (cancelled) return;
      setEligible(state.eligible);
    });

    return () => {
      cancelled = true;
    };
  }, [ready, runId]);

  const show =
    eligible &&
    postDelivery.resolved &&
    !postDelivery.show &&
    !shipOutcome.show;

  const submit = useCallback(
    async (response: string) => {
      if (!ready || busy) return;
      setBusy(true);
      setError(null);
      const id = await recordFrictionResponse({
        runId: runId ?? null,
        response,
      });
      setBusy(false);
      if (!id) {
        setError(copy.friction.error);
        return;
      }
      setEligible(false);
    },
    [busy, ready, runId]
  );

  const dismiss = useCallback(async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    const id = await recordFrictionResponse({
      runId: runId ?? null,
      dismissed: true,
    });
    setBusy(false);
    if (!id) {
      setError(copy.friction.error);
      return;
    }
    setEligible(false);
  }, [busy, ready, runId]);

  return { show, busy, error, submit, dismiss };
};

export default useFrictionPrompt;
