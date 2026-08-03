"use client";

import DesktopOnboardingScreen from "@/components/desktop/auth/DesktopOnboardingScreen";
import { useIsDesktop } from "@/hooks";
import OnboardingScreen from "@/screens/OnboardingScreen";

const OnboardingPage = () => {
  const { isDesktop } = useIsDesktop();
  if (isDesktop) return <DesktopOnboardingScreen />;
  return <OnboardingScreen />;
};

export default OnboardingPage;
