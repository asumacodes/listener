"use client";

import {
  detectHandoffPlatform,
  requestPipelineNotification,
  type HandoffPlatform,
} from "@/lib/handoff/platform";
import { enablePushSubscription } from "@/lib/push/client";
import { useCallback, useState, useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

const useDetectedPlatform = (): HandoffPlatform =>
  useSyncExternalStore(subscribeNoop, detectHandoffPlatform, () => "standard");

type HandoffPresentation = {
  platform: HandoffPlatform;
  dismissed: boolean;
  onNotify: () => void;
  onDismiss: () => void;
};

const useHandoffPresentation = (): HandoffPresentation => {
  const detected = useDetectedPlatform();
  const [platformOverride, setPlatformOverride] =
    useState<HandoffPlatform | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const platform = platformOverride ?? detected;

  const onNotify = useCallback(() => {
    void requestPipelineNotification().then(async (granted) => {
      if (granted) setPlatformOverride("granted");
      if (granted) {
        await enablePushSubscription();
      }
    });
  }, []);

  const onDismiss = useCallback(() => setDismissed(true), []);

  return { platform, dismissed, onNotify, onDismiss };
};

export default useHandoffPresentation;
