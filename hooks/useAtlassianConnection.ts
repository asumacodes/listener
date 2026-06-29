"use client";

import {
  disconnectAtlassian,
  getAtlassianStatus,
  type AtlassianStatus,
} from "@/lib/integrations/atlassian/client";
import { useCallback, useEffect, useState } from "react";

const useAtlassianConnection = () => {
  const [status, setStatus] = useState<AtlassianStatus | null>(null);

  useEffect(() => {
    let active = true;
    getAtlassianStatus()
      .then((nextStatus) => {
        if (active) setStatus(nextStatus);
      })
      .catch(() => {
        if (active) setStatus({ connected: false });
      });

    return () => {
      active = false;
    };
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectAtlassian();
    setStatus({ connected: false });
  }, []);

  return { status, disconnect };
};

export default useAtlassianConnection;
