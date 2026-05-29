"use client";

import TabBar from "@/components/nav/TabBar";
import { useTabBar } from "@/components/nav/TabBarContext";

const TabBarVisibility = () => {
  const { hidden } = useTabBar();
  if (hidden) return null;
  return <TabBar />;
};

export default TabBarVisibility;
