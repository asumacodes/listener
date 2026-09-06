"use client";

import { copy } from "@/lib/design/copy";
import {
  getShipOutcomeState,
  recordShipOutcome,
} from "@/lib/feedback-prompts/shipOutcome";
import { useCallback, useEffect, useState } from "react";

type UseShipOutcomePromptArgs = {
  runId: string | null | undefined;
  ready: boolean;
};

const useShipOutcomePrompt = ({ runId, ready }: UseShipOutcomePromptArgs) => {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeKey = ready && runId ? runId : null;
  const [appliedKey, setAppliedKey] = useState(scopeKey);
  if (appliedKey !== scopeKey) {
    setAppliedKey(scopeKey);
    setShow(false);
    setError(null);
  }

  useEffect(() => {
    if (!ready || !runId) return;

    let cancelled = false;
    void getShipOutcomeState(runId).then((state) => {
      if (cancelled) return;
      setShow(state.ready);
    });

    return () => {
      cancelled = true;
    };
  }, [ready, runId]);

  const submit = useCallback(
    async ({
      shippedWhat,
      liveProductUrl,
      publicConsent,
    }: {
      shippedWhat: string;
      liveProductUrl?: string | null;
      publicConsent: boolean;
    }) => {
      if (!ready || !runId || busy) return;
      setBusy(true);
      setError(null);
      const result = await recordShipOutcome({
        runId,
        shippedWhat,
        liveProductUrl,
        publicConsent,
      });
      setBusy(false);
      if (!result.ok) {
        setError(
          result.reason === "incomplete"
            ? copy.shipOutcome.incomplete
            : copy.shipOutcome.error
        );
        return;
      }
      setShow(false);
    },
    [busy, ready, runId]
  );

  return { show, busy, error, submit };
};

export default useShipOutcomePrompt;
