import DesktopSettingsScreen from "@/components/desktop/account/DesktopSettingsScreen";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const DesktopSettingsPage = () => (
  <Suspense
    fallback={
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted">
        Loading settings…
      </div>
    }
  >
    <DesktopSettingsScreen />
  </Suspense>
);

export default DesktopSettingsPage;
