"use client";

import { copy } from "@/lib/design/copy";
import {
  detectHandoffPlatform,
  requestPipelineNotification,
} from "@/lib/handoff/platform";
import {
  enablePushSubscription,
  getNotificationPermission,
  hasPushSubscription,
  pushEnableUserMessage,
  pushSupported,
} from "@/lib/push/client";
import { useCallback, useEffect, useState } from "react";

export type NotificationSettingsState =
  | "loading"
  | "unsupported"
  | "iosNeedsInstall"
  | "prompt"
  | "denied"
  | "needsSubscribe"
  | "on";

type NotificationSettings = {
  state: NotificationSettingsState;
  busy: boolean;
  error: string | null;
  enable: () => void;
};

const resolveState = async (): Promise<NotificationSettingsState> => {
  if (!pushSupported()) return "unsupported";
  if (detectHandoffPlatform() === "iosSafari") return "iosNeedsInstall";

  const permission = getNotificationPermission();
  if (permission === "unsupported") return "unsupported";
  if (permission === "denied") return "denied";
  if (permission === "default") return "prompt";

  const subscribed = await hasPushSubscription();
  return subscribed ? "on" : "needsSubscribe";
};

const useNotificationSettings = (): NotificationSettings => {
  const [state, setState] = useState<NotificationSettingsState>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void resolveState()
      .then((next) => {
        if (active) setState(next);
      })
      .catch(() => {
        if (active) setState("unsupported");
      });
    return () => {
      active = false;
    };
  }, []);

  const enable = useCallback(() => {
    if (busy) return;
    setBusy(true);
    setError(null);

    void (async () => {
      try {
        const permission = getNotificationPermission();
        let granted = permission === "granted";

        if (!granted) {
          granted = await requestPipelineNotification();
        }

        if (!granted) {
          const nextPermission = getNotificationPermission();
          setState(nextPermission === "denied" ? "denied" : "prompt");
          return;
        }

        const result = await enablePushSubscription();
        if (result.ok) {
          setState("on");
          setError(null);
          return;
        }

        setState("needsSubscribe");
        setError(
          pushEnableUserMessage(result.reason) ??
            copy.settings.notificationsSubscribeFailed
        );
      } finally {
        setBusy(false);
      }
    })();
  }, [busy]);

  return { state, busy, error, enable };
};

export default useNotificationSettings;
