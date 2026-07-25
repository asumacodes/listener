"use client";

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

const AppTabLayout = ({ children }: AppTabLayoutProps) => (
  <QueryProvider>
    <TabBarProvider>
      <ProfileProvider>
        <div className="flex h-dvh min-h-dvh flex-col overflow-hidden">
          <MainSlot>{children}</MainSlot>
        </div>
        <TabBarVisibility />
      </ProfileProvider>
    </TabBarProvider>
  </QueryProvider>
);

export default AppTabLayout;
