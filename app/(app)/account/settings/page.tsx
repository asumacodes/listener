"use client";

import { Suspense } from "react";
import SettingsScreen from "@/screens/SettingsScreen";

const SettingsPage = () => (
  <Suspense fallback={null}>
    <SettingsScreen />
  </Suspense>
);

export default SettingsPage;
