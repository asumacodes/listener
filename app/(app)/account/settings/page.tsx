"use client";

import { Suspense } from "react";
import SkeletonSettings from "@/components/ui/skeleton/SkeletonSettings";
import SettingsScreen from "@/screens/SettingsScreen";

const SettingsPage = () => (
  <Suspense fallback={<SkeletonSettings variant="mobile" />}>
    <SettingsScreen />
  </Suspense>
);

export default SettingsPage;
