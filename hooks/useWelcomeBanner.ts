"use client";

import { useCallback, useEffect, useState } from "react";
import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";
import { getSessionUser } from "@/lib/auth/session";
import { copy } from "@/lib/design/copy";
import {
  readWelcomeDismissed,
  writeWelcomeDismissed,
} from "@/lib/onboarding/welcomeDismiss";
import type { BalanceDisplay } from "@/types/billing";

type WelcomeCopy = { title: string; body: string };

const TEACH: WelcomeCopy = {
  title: copy.welcome.titleRecord,
  body: copy.welcome.bodyTeach,
};

const selectCopy = (balance: BalanceDisplay | null): WelcomeCopy | null => {
  if (!balance || balance.bypass) return TEACH;
  if (!balance.can_kickoff) return null;
  if (balance.subscription_grant_remaining + balance.purchased_balance > 0) {
    return {
      title: copy.welcome.titleNoCard,
      body: copy.welcome.bodyPaid(balance.effectiveRemaining),
    };
  }
  if (balance.free_grant_remaining > 0) {
    return {
      title: copy.welcome.titleNoCard,
      body: copy.welcome.bodyFree(balance.free_grant_remaining),
    };
  }
  return null;
};

const useWelcomeBanner = ({ emptyStudio }: { emptyStudio: boolean }) => {
  // Shared balance query — no extra get_effective_balance read per mount.
  const { balance, loading } = useEntitlementBalance();
  const ready = !loading;
  const [userId, setUserId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await getSessionUser();
      if (cancelled) return;
      const id = user?.id ?? null;
      setUserId(id);
      if (id) setDismissed(readWelcomeDismissed(id));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (userId) writeWelcomeDismissed(userId);
  }, [userId]);

  const bypass = Boolean(balance?.bypass);
  const canKickoff = Boolean(balance?.can_kickoff);
  const eligible =
    ready &&
    emptyStudio &&
    !dismissed &&
    (bypass || balance === null || canKickoff);

  const selected = eligible ? selectCopy(balance) : null;
  const show = Boolean(selected);

  return {
    show,
    title: selected?.title ?? "",
    body: selected?.body ?? "",
    dismiss,
  };
};

export default useWelcomeBanner;
