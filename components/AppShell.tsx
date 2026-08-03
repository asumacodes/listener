"use client";

import OfflineOverlay from "@/components/OfflineOverlay";
import SurfaceSync from "@/components/desktop/SurfaceSync";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => (
  <>
    <SurfaceSync />
    {children}
    <OfflineOverlay />
  </>
);

export default AppShell;
