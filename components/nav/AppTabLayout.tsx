"use client";

import { TabBarProvider } from "@/components/nav/TabBarContext";
import TabBarVisibility from "@/components/nav/TabBarVisibility";
import type { ReactNode } from "react";

type AppTabLayoutProps = {
  children: ReactNode;
};

const AppTabLayout = ({ children }: AppTabLayoutProps) => (
  <TabBarProvider>
    <div className="min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      {children}
    </div>
    <TabBarVisibility />
  </TabBarProvider>
);

export default AppTabLayout;
