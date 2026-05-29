"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TabBarContextValue = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

const TabBarContext = createContext<TabBarContextValue | null>(null);

export const TabBarProvider = ({ children }: { children: ReactNode }) => {
  const [hidden, setHidden] = useState(false);
  return (
    <TabBarContext.Provider value={{ hidden, setHidden }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const ctx = useContext(TabBarContext);
  if (!ctx) {
    throw new Error("useTabBar must be used within TabBarProvider");
  }
  return ctx;
};
