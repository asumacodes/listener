import DesktopSettingsScreen from "@/components/desktop/account/DesktopSettingsScreen";
import SkeletonSettings from "@/components/ui/skeleton/SkeletonSettings";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const DesktopSettingsPage = () => (
  <Suspense fallback={<SkeletonSettings variant="desktop" />}>
    <DesktopSettingsScreen />
  </Suspense>
);

export default DesktopSettingsPage;
