"use client";

import {
  IconBell,
  IconCheck,
  IconShare,
} from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import useHandoffPresentation from "@/hooks/useHandoffPresentation";
import { copy } from "@/lib/design/copy";
import type { ReactNode } from "react";

const GoldRing = () => (
  <div
    className="gold-ring animate-spin-slow"
    style={{ animationDuration: "2.4s" }}
    aria-label="Sending"
  />
);

const HandoffScreen = () => {
  const { platform, dismissed, onNotify, onDismiss } = useHandoffPresentation();

  let card: ReactNode = null;
  if (platform === "granted") {
    card = (
      <div className="granted-line">
        <span className="text-gold">
          <IconCheck size={15} />
        </span>
        We&apos;ll notify you when it&apos;s ready.
      </div>
    );
  } else if (!dismissed) {
    if (platform === "iosSafari") {
      card = (
        <div className="inset-card">
          <div className="inset-head">
            <div className="inset-icon">
              <IconShare size={20} />
            </div>
            <p className="inset-body">
              Add Listener to your home screen to get notified and pick up where
              you left off.
            </p>
          </div>
          <p className="inset-hint">
            Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>
          </p>
        </div>
      );
    } else {
      card = (
        <div className="inset-card">
          <div className="inset-head">
            <div className="inset-icon">
              <IconBell size={20} />
            </div>
            <p className="inset-body">Want a heads-up when it&apos;s done?</p>
          </div>
          <div className="inset-actions">
            <Button fullWidth onClick={onNotify}>
              Notify me
            </Button>
            <button
              type="button"
              className="type-textlink mt-1"
              onClick={onDismiss}
            >
              Not now
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <div className="handoff-center flex flex-1 flex-col items-center justify-center px-5 text-center">
        <GoldRing />
        <h1 className="mt-7 font-serif text-[26px] leading-tight text-text">
          {copy.handoff.title}
        </h1>
        <p className="handoff-sub mt-2 max-w-[300px] text-sm leading-relaxed text-text-secondary">
          This takes a few minutes. You can leave — we&apos;ll let you know the
          moment it&apos;s ready.
        </p>
        <div className="handoff-card-slot mt-7 w-full max-w-[330px]">
          {card}
        </div>
      </div>
    </div>
  );
};

export default HandoffScreen;
