"use client";

import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { trackAtlassianConnected } from "@/lib/analytics/events";
import { openAtlassianOAuthPopup } from "@/lib/integrations/atlassian/popup";
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
  useEffect(() => {
    if (!open) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.atlassian === "connected") {
        trackAtlassianConnected(
          e.data.context === "settings" ? "settings" : "pre_run"
        );
        onConnected();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, onConnected]);

  const connect = () => {
    // Full-page fallback leaves capture UI; the recording row is already saved.
    openAtlassianOAuthPopup("pre_run");
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div>
        <h2 className="font-serif text-2xl leading-tight text-text">
          {copy.atlassianGate.title}
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">
          Murmur builds your Jira board and Confluence space directly in your
          own Atlassian workspace. Connect to run the pipeline - your transcript
          stays right here.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button fullWidth onClick={connect}>
            {copy.atlassianGate.connect}
          </Button>
          <button type="button" onClick={onClose} className={ui.textLink}>
            {copy.atlassianGate.notNow}
          </button>
        </div>
        <p className="mt-4 text-center text-[13px] leading-relaxed text-text-secondary">
          {copy.atlassianGate.savedMobile}
        </p>
      </div>
    </BottomSheet>
  );
};

export default AtlassianConnectSheet;
