"use client";

import {
  IconBell,
  IconCheck,
  IconShare,
} from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import useHandoffPresentation from "@/hooks/useHandoffPresentation";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { flowScreenClass } from "@/lib/layout/shell";
import type { ReactNode } from "react";

const GoldRing = () => (
  <div
    className="relative h-[72px] w-[72px] rounded-full border-2 border-gold/30"
    aria-label="Sending"
  >
    <div
      className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin-slow"
      style={{ animationDuration: "2.4s" }}
    />
  </div>
);

const HandoffScreen = () => {
  const { platform, checking, dismissed, onNotify, onDismiss } =
    useHandoffPresentation();

  let card: ReactNode = null;
  if (platform === "granted") {
    card = (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-success-surface px-4 py-3 text-sm text-success-text">
        <span className="text-gold">
          <IconCheck size={15} />
        </span>
        We&apos;ll notify you when it&apos;s ready.
      </div>
    );
  } else if (!checking && !dismissed) {
    if (platform === "iosSafari") {
      card = (
        <div className="rounded-2xl border border-border bg-surface px-4 py-4 text-left">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-10 text-gold">
              <IconShare size={20} />
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Add Listener to your home screen to get notified and pick up where
              you left off.
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Tap <strong className="font-semibold text-gold">Share</strong>, then{" "}
            <strong className="font-semibold text-gold">
              Add to Home Screen
            </strong>
          </p>
        </div>
      );
    } else {
      card = (
        <div className="rounded-2xl border border-border bg-canvas px-4 py-4 text-left">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-10 text-gold">
              <IconBell size={20} />
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Want a heads-up when it&apos;s done?
            </p>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button fullWidth onClick={onNotify}>
              Notify me
            </Button>
            <button type="button" className={ui.textLink} onClick={onDismiss}>
              Not now
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`${flowScreenClass} animate-fade-in`}>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <GoldRing />
        <h1 className="mt-7 font-serif text-[26px] leading-tight text-text">
          {copy.handoff.title}
        </h1>
        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-text-secondary">
          This takes a few minutes. You can leave — we&apos;ll let you know the
          moment it&apos;s ready.
        </p>
        <div className="mt-7 w-full max-w-[330px]">{card}</div>
      </div>
    </div>
  );
};

export default HandoffScreen;
