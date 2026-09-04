"use client";

import { RunsRemainingPill } from "@/components/billing/RunsRemainingPill";
import { ProfileProvider } from "@/components/profile/ProfileProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { TabBarProvider, useTabBar } from "@/components/nav/TabBarContext";
import TabBarVisibility from "@/components/nav/TabBarVisibility";
import type { ReactNode } from "react";

type AppTabLayoutProps = {
  children: ReactNode;
};

const MainSlot = ({ children }: { children: ReactNode }) => {
  const { hidden } = useTabBar();

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
        hidden
          ? ""
          : "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-20"
      }`}
    >
      {children}
    </div>
  );
};

function MobileRunsRemaining() {
  const { hidden } = useTabBar();
  if (hidden) return null;
  return (
    <div className="fixed right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.5rem)] z-30">
      <RunsRemainingPill variant="chip" />
    </div>
  );
}

const AppTabLayout = ({ children }: AppTabLayoutProps) => (
  <QueryProvider>
    <TabBarProvider>
      <ProfileProvider>
        <div className="flex h-dvh min-h-dvh flex-col overflow-hidden">
          <MainSlot>{children}</MainSlot>
        </div>
        <TabBarVisibility />
        <MobileRunsRemaining />
      </ProfileProvider>
    </TabBarProvider>
  </QueryProvider>
);

export default AppTabLayout;
