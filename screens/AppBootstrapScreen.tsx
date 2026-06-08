"use client";

import CaptureHeader from "@/components/layout/CaptureHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { captureScreenClass } from "@/lib/layout/shell";

const AppBootstrapScreen = () => (
  <div className={`${captureScreenClass} animate-fade-in flex`}>
    <CaptureHeader />
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
      <LoadingSpinner />
      <p className="text-sm text-muted">Restoring your session…</p>
    </div>
  </div>
);

export default AppBootstrapScreen;
