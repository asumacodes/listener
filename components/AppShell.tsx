"use client";

import { IdentifyOnAuth } from "@/components/analytics/IdentifyOnAuth";
import OfflineOverlay from "@/components/OfflineOverlay";
import SurfaceSync from "@/components/desktop/SurfaceSync";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => (
  <>
    <SurfaceSync />
    <IdentifyOnAuth />
    {children}
    <OfflineOverlay />
  </>
);

export default AppShell;
