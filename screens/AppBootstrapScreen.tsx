"use client";

import AppHeader from "@/components/AppHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const AppBootstrapScreen = () => (
  <div className="animate-fade-in flex min-h-[calc(100dvh-3rem)] flex-col">
    <AppHeader />
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <LoadingSpinner />
      <p className="text-sm text-muted">Restoring your session…</p>
    </div>
  </div>
);

export default AppBootstrapScreen;
