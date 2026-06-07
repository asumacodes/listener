"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RECONNECT_MS = 1800;

const initialOffline = () => typeof window !== "undefined" && !navigator.onLine;

/** Offline vs brief reconnecting beat before dismiss — mockup overlay states. */
export const useOfflineOverlayState = () => {
  const [visible, setVisible] = useState(initialOffline);
  const [reconnecting, setReconnecting] = useState(false);
  const wasOfflineRef = useRef(initialOffline());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleOffline = useCallback(() => {
    clearTimer();
    wasOfflineRef.current = true;
    setReconnecting(false);
    setVisible(true);
  }, [clearTimer]);

  const handleOnline = useCallback(() => {
    clearTimer();
    if (!wasOfflineRef.current) {
      setVisible(false);
      setReconnecting(false);
      return;
    }

    setReconnecting(true);
    setVisible(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setReconnecting(false);
      wasOfflineRef.current = false;
      timerRef.current = null;
    }, RECONNECT_MS);
  }, [clearTimer]);

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimer();
    };
  }, [handleOffline, handleOnline, clearTimer]);

  return { visible, reconnecting };
};

export default useOfflineOverlayState;
