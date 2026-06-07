"use client";

import { copy } from "@/lib/design/copy";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import Button from "@/components/ui/Button";
import { useEffect } from "react";

const OfflineOverlay = () => {
  const online = useOnlineStatus();

  useEffect(() => {
    if (!online) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [online]);

  if (online) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="offline-title"
      aria-describedby="offline-desc"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <h1 className="font-serif text-[28px] tracking-tight text-gold">
        Listener
      </h1>

      <div className="mt-10 max-w-[20rem] text-center">
        <p
          id="offline-title"
          className="font-serif text-2xl tracking-tight text-text"
        >
          {copy.offline.title}
        </p>
        <p
          id="offline-desc"
          className="mt-3 text-sm leading-relaxed text-text-secondary"
        >
          {copy.offline.body}
        </p>
      </div>

      <Button variant="ghost" onClick={() => window.location.reload()}>
        {copy.offline.retry}
      </Button>
    </div>
  );
};

export default OfflineOverlay;
