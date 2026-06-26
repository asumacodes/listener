"use client";

import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { useEffect } from "react";

type AtlassianConnectSheetProps = {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
};

const AtlassianConnectSheet = ({
  open,
  onClose,
  onConnected,
}: AtlassianConnectSheetProps) => {
  // Listen for the popup callback's success postMessage.
  useEffect(() => {
    if (!open) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.atlassian === "connected") onConnected();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, onConnected]);

  const connect = () => {
    const popup = window.open(
      "/api/integrations/atlassian/start?mode=popup",
      "atlassian_oauth",
      "width=520,height=720"
    );

    // Popup blocked / unsupported (some mobile PWA contexts) -> full-page
    // fallback. The transcript is lost in this rare path, but the user isn't
    // stuck. Most users never hit this.
    if (!popup || popup.closed) {
      window.location.href = "/api/integrations/atlassian/start";
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} lockDismiss>
      <div>
        <h2 className="font-serif text-2xl leading-tight text-text">
          Connect Atlassian to continue
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
          Murmur builds your Jira board and Confluence space directly in your
          own Atlassian workspace. Connect to run the pipeline - your transcript
          stays right here.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button fullWidth onClick={connect}>
            Connect Atlassian
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default AtlassianConnectSheet;
