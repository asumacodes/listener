"use client";

import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import useNotificationSettings from "@/hooks/useNotificationSettings";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import type { ReactNode } from "react";

const NotificationsSettingsCard = () => {
  const { state, busy, error, enable } = useNotificationSettings();

  let statusBody: ReactNode = null;

  if (state === "loading") {
    statusBody = (
      <p className="text-sm leading-relaxed text-muted">Checking…</p>
    );
  } else if (state === "unsupported") {
    statusBody = (
      <p className="text-sm leading-relaxed text-text-secondary">
        {copy.settings.notificationsUnsupported}
      </p>
    );
  } else if (state === "iosNeedsInstall") {
    statusBody = (
      <p className="text-sm leading-relaxed text-text-secondary">
        {copy.settings.notificationsIosNeedsInstall}
      </p>
    );
  } else if (state === "denied") {
    statusBody = (
      <p className="text-sm leading-relaxed text-text-secondary">
        {copy.settings.notificationsDenied}
      </p>
    );
  } else if (state === "on") {
    statusBody = (
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm font-medium text-text">Status</span>
        <StatusBadge variant="ready" showDot={false}>
          {copy.settings.notificationsOn}
        </StatusBadge>
      </div>
    );
  } else if (state === "prompt" || state === "needsSubscribe") {
    statusBody = (
      <div className="space-y-3">
        {error ? (
          <p className="text-sm text-red" role="alert">
            {error}
          </p>
        ) : null}
        <Button fullWidth onClick={enable} disabled={busy}>
          {state === "needsSubscribe"
            ? copy.settings.notificationsRegister
            : copy.settings.notificationsEnable}
        </Button>
      </div>
    );
  }

  return (
    <div className={`${ui.card} space-y-4 p-4`}>
      <p className="text-sm leading-relaxed text-text">
        {copy.settings.notificationsBody}
      </p>
      {statusBody}
    </div>
  );
};

export default NotificationsSettingsCard;
