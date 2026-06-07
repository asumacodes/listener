"use client";

import CaptureHeader from "@/components/layout/CaptureHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { appShellClass } from "@/lib/layout/shell";

const AppBootstrapScreen = () => (
  <div
    className={`${appShellClass} animate-fade-in flex min-h-[calc(100dvh-4.5rem)] flex-col`}
  >
    <CaptureHeader />
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <LoadingSpinner />
      <p className="text-sm text-muted">Restoring your session…</p>
    </div>
  </div>
);

export default AppBootstrapScreen;
