"use client";

import { IconWifiOff } from "@/components/icons/ListenerIcons";
import useOfflineOverlayState from "@/hooks/useOfflineOverlayState";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { copy } from "@/lib/design/copy";
import { useEffect } from "react";

const OfflineOverlay = () => {
  const { visible, reconnecting } = useOfflineOverlayState();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  const title = reconnecting
    ? copy.offline.reconnectingTitle
    : copy.offline.title;
  const body = reconnecting ? copy.offline.reconnectingBody : copy.offline.body;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="offline-title"
      aria-describedby="offline-desc"
      className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-canvas"
    >
      <div className="flex max-w-[24rem] flex-col items-center px-6 text-center">
        <div
          className={`relative mb-7 grid h-[88px] w-[88px] place-items-center ${
            reconnecting ? "text-gold" : "text-muted"
          }`}
        >
          {reconnecting ? (
            <span
              className={`absolute inset-0 rounded-full border-[3px] border-[var(--gold-15)] border-t-gold ${
                reduceMotion ? "" : "animate-spin-slow"
              }`}
              aria-hidden
            />
          ) : null}
          <span
            className={reconnecting && !reduceMotion ? "animate-pulse" : ""}
          >
            <IconWifiOff size={44} />
          </span>
        </div>

        <h1
          id="offline-title"
          className="mb-3 font-serif text-[30px] leading-[1.05] tracking-[-0.01em] text-text"
        >
          {title}
        </h1>
        <p
          id="offline-desc"
          className="max-w-[30ch] text-sm leading-relaxed text-text-secondary"
        >
          {body}
        </p>
      </div>
    </div>
  );
};

export default OfflineOverlay;
