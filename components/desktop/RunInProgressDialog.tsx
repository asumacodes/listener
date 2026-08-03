"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type RunInProgressDialogProps = {
  open: boolean;
  /** True when the blocking run belongs to the idea the user is looking at. */
  sameIdea: boolean;
  /** e.g. "Stage 3 of 4" — omitted when the active run's stage is unknown. */
  activeStageLabel?: string | null;
  activeIdeaTitle?: string | null;
  /** Live view for the blocking run (or projects when it's another idea). */
  watchHref: string;
  onClose: () => void;
};

/**
 * Desktop hard-block for run_in_progress on the idea page.
 * Same-idea uses local title/stage; cross-idea uses generic copy + projects CTA.
 */
const RunInProgressDialog = ({
  open,
  sameIdea,
  activeStageLabel = null,
  activeIdeaTitle = null,
  watchHref,
  onClose,
}: RunInProgressDialogProps) => {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 cursor-default bg-[var(--scrim)]"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="run-in-progress-title"
        className="relative w-[min(420px,calc(100vw-2rem))] rounded-3xl border border-border bg-surface px-[34px] pt-9 pb-[30px] text-center shadow-[0_24px_80px_rgba(26,26,26,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-[18px] right-5 text-[15px] text-muted transition hover:text-text"
        >
          ×
        </button>

        <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden />
          <span className="text-[9px] font-medium tracking-[0.14em] text-text-secondary uppercase">
            Already running
          </span>
        </span>

        <div className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-full ring-1 ring-gold-15">
          <span className="grid h-[68px] w-[68px] place-items-center rounded-full bg-gold-10">
            <span className="flex gap-[5px]" aria-hidden>
              <span className="h-[22px] w-[5px] rounded-full bg-gold" />
              <span className="h-[22px] w-[5px] rounded-full bg-gold" />
            </span>
          </span>
        </div>

        <h2
          id="run-in-progress-title"
          className="mt-7 font-serif text-[29px] leading-[1.2] text-text"
        >
          {sameIdea
            ? "This idea is already running"
            : "A run is already in progress"}
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
          {sameIdea
            ? "Hang on until it finishes — running it twice at once would overwrite the artifacts mid-build."
            : "Listener builds one idea at a time. Yours hasn’t started — try again once the current run finishes."}
        </p>

        {activeIdeaTitle ? (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-canvas px-4 py-3.5 text-left">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
              aria-hidden
            />
            <span className="truncate text-[13px] text-text">
              {activeIdeaTitle}
            </span>
            {activeStageLabel ? (
              <span className="ml-auto shrink-0 text-[11px] tracking-[0.08em] text-gold-deep uppercase">
                {activeStageLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-xl border border-border text-sm font-medium text-text transition hover:bg-canvas"
        >
          Got it
        </button>
        <Link
          href={watchHref}
          onClick={onClose}
          className="mt-3.5 inline-block text-xs font-medium text-gold-deep hover:text-text"
        >
          Watch it build →
        </Link>
      </div>
    </div>,
    document.body
  );
};

export default RunInProgressDialog;
