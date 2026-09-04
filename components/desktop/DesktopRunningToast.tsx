"use client";

import { copy } from "@/lib/design/copy";
import Link from "next/link";

type DesktopRunningToastProps = {
  ideaId: string;
  ask: boolean;
  busy: boolean;
  onNotify: () => void;
  onDismiss: () => void;
};

const DesktopRunningToast = ({
  ideaId,
  ask,
  busy,
  onNotify,
  onDismiss,
}: DesktopRunningToastProps) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-11">
    <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 text-sm shadow-toast">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
      <span className="text-text-secondary">
        {ask ? copy.waitNotify.ask : copy.waitNotify.promise}
      </span>
      {ask ? (
        <button
          type="button"
          onClick={onNotify}
          disabled={busy}
          className="font-medium text-gold hover:brightness-110 disabled:text-muted"
        >
          {copy.waitNotify.notify}
        </button>
      ) : null}
      <Link
        href={`/ideas/${ideaId}`}
        className="font-medium text-gold hover:brightness-110"
      >
        {copy.waitNotify.watch}
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-muted hover:text-text"
      >
        ×
      </button>
    </div>
  </div>
);

export default DesktopRunningToast;
