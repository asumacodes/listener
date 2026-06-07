"use client";

import CaptureHeader from "@/components/layout/CaptureHeader";
import RecordButton from "@/components/RecordButton";
import { copy } from "@/lib/design/copy";
import { appShellClass } from "@/lib/layout/shell";

const IdleScreen = ({ onRecord }: { onRecord: () => void }) => (
  <div
    className={`${appShellClass} animate-fade-in min-h-[calc(100dvh-4.5rem)]`}
  >
    <CaptureHeader />
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <RecordButton mode="idle" onClick={onRecord} />
      <p className="text-sm text-muted">{copy.idle.hint}</p>
    </div>
    <p className="type-eyebrow pb-4 text-center">{copy.idle.tagline}</p>
  </div>
);

export default IdleScreen;
