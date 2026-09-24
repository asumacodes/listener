"use client";

import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { getSessionUser } from "@/lib/auth/session";
import { copy } from "@/lib/design/copy";
import {
  readSecondRunNudgeDismissed,
  writeSecondRunNudgeDismissed,
} from "@/lib/onboarding/secondRunNudgeDismiss";
import type { DesktopIdeaCardModel } from "@/types/desktop";
import { useCallback, useEffect, useState } from "react";

type UseSecondRunNudgeArgs = {
  emptyStudio: boolean;
  ideas: DesktopIdeaCardModel[];
};

/**
 * First-run-scoped ambient nudge. Eligibility from the grid's ideas list
 * (in-place on card-flip). Separate dismiss key from the celebration overlay.
 */
const useSecondRunNudge = ({ emptyStudio, ideas }: UseSecondRunNudgeArgs) => {
  // Shared balance query — no extra get_effective_balance read per mount.
  const { balance, loading } = useEntitlementBalance();
  const ready = !loading;
  const canKickoff = Boolean(balance?.can_kickoff);
  const remaining = balance?.effectiveRemaining ?? null;
  const [userId, setUserId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await getSessionUser();
      if (cancelled) return;
      const id = user?.id ?? null;
      setUserId(id);
      if (id) setDismissed(readSecondRunNudgeDismissed(id));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (userId) writeSecondRunNudgeDismissed(userId);
  }, [userId]);

  const anyRunning = ideas.some((idea) => idea.status === "running");
  const doneCount = ideas.filter((idea) => idea.status === "done").length;
  const show =
    ready &&
    !emptyStudio &&
    !anyRunning &&
    doneCount === 1 &&
    canKickoff &&
    remaining != null &&
    remaining > 0 &&
    !dismissed;

  return {
    show,
    title: copy.secondRun.title,
    body: remaining != null ? copy.secondRun.body(remaining) : "",
    dismiss,
  };
};

export default useSecondRunNudge;
