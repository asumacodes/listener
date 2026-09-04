"use client";

import CaptureHeader from "@/components/layout/CaptureHeader";
import RecordButton from "@/components/RecordButton";
import { ui } from "@/lib/design/ui";
import { copy } from "@/lib/design/copy";
import { captureScreenClass } from "@/lib/layout/shell";
import type { ReactNode } from "react";

const IdleScreen = ({
  onRecord,
  banner = null,
  explainer,
}: {
  onRecord: () => void;
  banner?: ReactNode;
  explainer?: string;
}) => (
  <div className={`${captureScreenClass} animate-fade-in flex`}>
    <CaptureHeader />

    {banner ? <div className="shrink-0 px-5 pt-3">{banner}</div> : null}

    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
      <RecordButton mode="idle" onClick={onRecord} />
      <p className={ui.eyebrow}>{copy.idle.hint}</p>
      {explainer ? (
        <p className="max-w-[28ch] text-center text-sm leading-relaxed text-text-secondary">
          {explainer}
        </p>
      ) : null}
    </div>

    <p className={`${ui.eyebrow} shrink-0 pb-4 text-center text-gold`}>
      {copy.idle.tagline}
    </p>
  </div>
);

export default IdleScreen;
