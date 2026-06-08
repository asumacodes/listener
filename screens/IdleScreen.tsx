"use client";

import CaptureHeader from "@/components/layout/CaptureHeader";
import RecordButton from "@/components/RecordButton";
import { ui } from "@/lib/design/ui";
import { copy } from "@/lib/design/copy";
import { captureScreenClass } from "@/lib/layout/shell";

const IdleScreen = ({ onRecord }: { onRecord: () => void }) => (
  <div className={`${captureScreenClass} animate-fade-in flex`}>
    <CaptureHeader />

    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
      <RecordButton mode="idle" onClick={onRecord} />
      <p className={ui.eyebrow}>{copy.idle.hint}</p>
    </div>

    <p className={`${ui.eyebrow} shrink-0 pb-4 text-center text-gold`}>
      {copy.idle.tagline}
    </p>
  </div>
);

export default IdleScreen;
