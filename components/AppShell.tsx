"use client";

import { IdentifyOnAuth } from "@/components/analytics/IdentifyOnAuth";
import OfflineOverlay from "@/components/OfflineOverlay";
import SurfaceSync from "@/components/desktop/SurfaceSync";
import QueryProvider from "@/components/providers/QueryProvider";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => (
  <QueryProvider>
    <SurfaceSync />
    <IdentifyOnAuth />
    {children}
    <OfflineOverlay />
  </QueryProvider>
);

export default AppShell;
