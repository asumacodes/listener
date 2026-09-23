"use client";

import {
  disconnectAtlassian,
  getAtlassianStatus,
  type AtlassianStatus,
} from "@/lib/integrations/atlassian/client";
import { useCallback, useEffect, useState } from "react";

/**
 * Atlassian connection status. `status` stays null until a read succeeds —
 * a failed read is `failed`, never `{ connected: false }`, so the UI can't
 * tell a connected user they're disconnected. Consumers gating on
 * `status?.connected === false` therefore only act on a confirmed read.
 */
const useAtlassianConnection = () => {
  const [status, setStatus] = useState<AtlassianStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getAtlassianStatus()
      .then((nextStatus) => {
        if (!active) return;
        setStatus(nextStatus);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectAtlassian();
    setStatus({ connected: false });
  }, []);

  return {
    status,
    /** No confirmed read yet and not failed — render a skeleton, not a guess. */
    loading: status === null && !failed,
    failed: status === null && failed,
    retry,
    disconnect,
  };
};

export default useAtlassianConnection;
