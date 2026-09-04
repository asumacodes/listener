"use client";

import {
  trackAtlassianConnected,
  trackRunKickedOff,
} from "@/lib/analytics/events";
import { openAtlassianOAuthPopup } from "@/lib/integrations/atlassian/popup";
import { startPipelineRun } from "@/lib/murmur/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/** Open the existing pre_run OAuth popup, then kick off the saved recording. */
const useAtlassianPreRunConnect = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pendingId = useRef<string | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.atlassian !== "connected") return;
      trackAtlassianConnected(
        e.data.context === "settings" ? "settings" : "pre_run"
      );
      const recordingId = pendingId.current;
      pendingId.current = null;
      if (!recordingId) return;
      void (async () => {
        const result = await startPipelineRun(recordingId);
        if (result.ok) {
          trackRunKickedOff(result.runId, recordingId, "desktop", false);
        }
        await queryClient.invalidateQueries({
          queryKey: ["desktop-home-ideas"],
        });
        router.refresh();
      })();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [queryClient, router]);

  const connectAndBuild = useCallback((recordingId: string) => {
    pendingId.current = recordingId;
    openAtlassianOAuthPopup("pre_run");
  }, []);

  return { connectAndBuild };
};

export default useAtlassianPreRunConnect;
