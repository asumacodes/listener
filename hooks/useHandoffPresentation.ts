"use client";

import {
  detectHandoffPlatform,
  requestPipelineNotification,
  type HandoffPlatform,
} from "@/lib/handoff/platform";
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
    void requestPipelineNotification().then((granted) => {
      if (granted) setPlatformOverride("granted");
    });
  }, []);

  const onDismiss = useCallback(() => setDismissed(true), []);

  return { platform, dismissed, onNotify, onDismiss };
};

export default useHandoffPresentation;
