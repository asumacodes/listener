"use client";

import CaptureLauncherModal from "@/components/desktop/CaptureLauncherModal";
import { CaptureLauncherProvider } from "@/components/desktop/CaptureLauncherContext";
import FeedbackDialog from "@/components/desktop/FeedbackDialog";
import { FeedbackDialogProvider } from "@/components/desktop/FeedbackDialogContext";
import DesktopRail from "@/components/desktop/DesktopRail";
import QueryProvider from "@/components/providers/QueryProvider";
import { ProfileProvider } from "@/components/profile/ProfileProvider";
import type { ReactNode } from "react";

type DesktopShellProps = {
  children: ReactNode;
};

/**
 * Desktop workspace chrome — full-bleed rail + canvas.
 * Does not mount mobile AppTabLayout / TabBar.
 */
const DesktopShell = ({ children }: DesktopShellProps) => (
  <QueryProvider>
    <ProfileProvider>
      <CaptureLauncherProvider>
        <FeedbackDialogProvider>
          <div className="flex h-dvh min-h-dvh overflow-hidden bg-canvas">
            <DesktopRail />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
          <CaptureLauncherModal />
          <FeedbackDialog />
        </FeedbackDialogProvider>
      </CaptureLauncherProvider>
    </ProfileProvider>
  </QueryProvider>
);

export default DesktopShell;
