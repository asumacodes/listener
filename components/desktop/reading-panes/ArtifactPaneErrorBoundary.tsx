"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import Button from "@/components/ui/Button";
import * as Sentry from "@sentry/nextjs";
import type { ReactNode } from "react";

type ArtifactPaneErrorBoundaryProps = {
  /** Remount (and clear error state) when the selected artifact changes. */
  resetKey: string;
  children: ReactNode;
};

/**
 * Isolates artifact pane render failures so the idea shell (index, pipeline)
 * stays usable. Reports to Sentry; switching artifacts remounts via resetKey.
 */
const ArtifactPaneErrorBoundary = ({
  resetKey,
  children,
}: ArtifactPaneErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    key={resetKey}
    beforeCapture={(scope) => {
      scope.setTag("surface", "artifact-reading-pane");
      scope.setTag("artifact", resetKey);
    }}
    fallback={({ resetError }) => (
      <ReadingPane
        variant="wide"
        eyebrow="Artifact"
        title="Couldn't render this artifact"
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          Something in this artifact&apos;s data couldn&apos;t be displayed.
          Switch to another artifact, or try again.
        </p>
        <div className="mt-6">
          <Button type="button" onClick={resetError}>
            Try again
          </Button>
        </div>
      </ReadingPane>
    )}
  >
    {children}
  </Sentry.ErrorBoundary>
);

export default ArtifactPaneErrorBoundary;
