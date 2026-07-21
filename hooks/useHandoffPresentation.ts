"use client";

import {
  detectHandoffPlatform,
  requestPipelineNotification,
  type HandoffPlatform,
} from "@/lib/handoff/platform";
import {
  enablePushSubscription,
  getNotificationPermission,
  hasPushSubscription,
} from "@/lib/push/client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

const useDetectedPlatform = (): HandoffPlatform =>
  useSyncExternalStore(subscribeNoop, detectHandoffPlatform, () => "standard");

type HandoffPresentation = {
  platform: HandoffPlatform;
  /** True while resolving whether notifications are already enabled. */
  checking: boolean;
  dismissed: boolean;
  onNotify: () => void;
  onDismiss: () => void;
};

const useHandoffPresentation = (): HandoffPresentation => {
  const detected = useDetectedPlatform();
  const [platformOverride, setPlatformOverride] =
    useState<HandoffPlatform | null>(null);
  const [dismissed, setDismissed] = useState(false);
  // Skip the CTA flash while we check granted + subscription (not needed on iOS Safari).
  const [pushCheckDone, setPushCheckDone] = useState(false);

  const platform = platformOverride ?? detected;
  const checking = detected !== "iosSafari" && !pushCheckDone;

  useEffect(() => {
    if (detected === "iosSafari") return;

    let active = true;

    void (async () => {
      try {
        const permission = getNotificationPermission();
        if (permission !== "granted") return;

        const subscribed = await hasPushSubscription();
        if (!active) return;

        if (subscribed) {
          setPlatformOverride("granted");
          return;
        }

        const result = await enablePushSubscription();
        if (!active) return;
        if (result.ok) {
          setPlatformOverride("granted");
        } else {
          console.warn("[push] handoff silent subscribe failed", result);
        }
      } finally {
        if (active) setPushCheckDone(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [detected]);

  const onNotify = useCallback(() => {
    void requestPipelineNotification().then(async (granted) => {
      if (granted) setPlatformOverride("granted");
      if (granted) {
        const result = await enablePushSubscription();
        if (!result.ok) {
          console.warn("[push] handoff subscribe failed", result);
        }
      }
    });
  }, []);

  const onDismiss = useCallback(() => setDismissed(true), []);

  return { platform, checking, dismissed, onNotify, onDismiss };
};

export default useHandoffPresentation;
