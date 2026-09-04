"use client";

import { getSessionUser } from "@/lib/auth/session";
import {
  readFirstCompletionSeen,
  writeFirstCompletionSeen,
} from "@/lib/onboarding/firstCompletionSeen";
import { countDoneRuns } from "@/lib/pipeline/doneCount";
import { useCallback, useEffect, useState } from "react";

/**
 * First-done celebration: count === 1 is first-ness; localStorage is once.
 * Does not show until both are resolved (no veteran flash).
 */
const useFirstCompletionCelebration = (isDone: boolean) => {
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  if (!isDone && show) {
    setShow(false);
  }

  useEffect(() => {
    if (!isDone) return;

    let cancelled = false;
    void (async () => {
      const user = await getSessionUser();
      if (cancelled) return;
      const id = user?.id ?? null;
      setUserId(id);
      if (id && readFirstCompletionSeen(id)) {
        setShow(false);
        return;
      }
      const done = await countDoneRuns();
      if (cancelled) return;
      if (done !== 1) {
        setShow(false);
        return;
      }
      if (id) writeFirstCompletionSeen(id);
      setShow(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isDone]);

  const dismiss = useCallback(() => {
    setShow(false);
    if (userId) writeFirstCompletionSeen(userId);
  }, [userId]);

  return { show, dismiss };
};

export default useFirstCompletionCelebration;
