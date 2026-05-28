"use client";

import OfflineOverlay from "@/components/OfflineOverlay";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => (
  <>
    {children}
    <OfflineOverlay />
  </>
);

export default AppShell;
