"use client";

import useOnlineStatus from "@/hooks/useOnlineStatus";
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
          You&apos;re offline
        </p>
        <p
          id="offline-desc"
          className="mt-3 text-sm leading-relaxed text-text-secondary"
        >
          Listener needs a connection to record, transcribe, and save. Playback
          streams from the cloud too — everything resumes when you&apos;re back
          online.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 text-sm text-muted underline-offset-2 transition hover:text-text hover:underline"
      >
        Try again
      </button>
    </div>
  );
};

export default OfflineOverlay;
