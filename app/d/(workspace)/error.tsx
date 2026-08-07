"use client";

import Button from "@/components/ui/Button";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type DesktopWorkspaceErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Segment error boundary for /d workspace routes.
 * Keeps DesktopShell (nav) mounted via the parent layout; only children swap.
 */
export default function DesktopWorkspaceError({
  error,
  reset,
}: DesktopWorkspaceErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-canvas px-8 text-center">
      <h2 className="font-serif text-2xl text-text">Something went wrong</h2>
      <p className="max-w-md text-sm leading-relaxed text-text-secondary">
        This view hit an unexpected error. Your run data is safe — try again, or
        pick another idea from the sidebar.
      </p>
      {error.digest ? (
        <p className="font-mono text-[11px] text-muted">Ref {error.digest}</p>
      ) : null}
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
