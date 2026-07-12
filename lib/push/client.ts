"use client";

export type PushEnableReason =
  | "ok"
  | "unsupported"
  | "permission_denied"
  | "missing_vapid"
  | "no_service_worker"
  | "subscribe_failed"
  | "missing_subscription_keys"
  | "persist_unauthorized"
  | "persist_invalid"
  | "persist_failed"
  | "persist_unreachable";

export type PushEnableResult = {
  ok: boolean;
  reason: PushEnableReason;
  detail?: string;
};

const SW_READY_TIMEOUT_MS = 8_000;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/** Prefer an existing registration; otherwise wait briefly for SW ready. */
async function getPushRegistration(): Promise<ServiceWorkerRegistration | null> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;

  try {
    const ready = navigator.serviceWorker.ready;
    const timedOut = new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), SW_READY_TIMEOUT_MS);
    });
    return await Promise.race([ready, timedOut]);
  } catch {
    return null;
  }
}

export async function hasPushSubscription(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

export const pushEnableUserMessage = (
  reason: PushEnableReason
): string | null => {
  switch (reason) {
    case "ok":
      return null;
    case "missing_vapid":
      return "Push isn’t configured for this environment (missing VAPID key).";
    case "no_service_worker":
      return "This browser doesn’t have an active service worker yet. Refresh and try again.";
    case "subscribe_failed":
      return "The browser couldn’t create a push subscription. Check the console for details.";
    case "missing_subscription_keys":
      return "The browser returned an incomplete push subscription.";
    case "persist_unauthorized":
      return "You’re signed out. Sign in again, then register this device.";
    case "persist_invalid":
      return "We couldn’t save the push subscription (invalid payload).";
    case "persist_failed":
      return "We couldn’t save the push subscription. Try again in a moment.";
    case "persist_unreachable":
      return "Couldn’t reach the server to save the push subscription.";
    case "permission_denied":
      return "Notifications are blocked for this site.";
    case "unsupported":
      return "Push notifications aren’t available in this browser.";
    default:
      return "Permission granted, but we couldn’t register this device.";
  }
};

/**
 * Permission must already be granted. Creates (or refreshes) a Web Push
 * subscription and POSTs it to /api/push/subscribe.
 */
export async function enablePushSubscription(): Promise<PushEnableResult> {
  if (!pushSupported()) {
    return { ok: false, reason: "unsupported" };
  }
  if (Notification.permission !== "granted") {
    return { ok: false, reason: "permission_denied" };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!vapidKey) {
    console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing");
    return { ok: false, reason: "missing_vapid" };
  }

  try {
    const registration = await getPushRegistration();
    if (!registration) {
      console.warn("[push] no service worker registration");
      return { ok: false, reason: "no_service_worker" };
    }

    // Drop any prior subscription so a VAPID key rotation doesn’t leave a
    // stale endpoint that the new private key can’t deliver to.
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await existing.unsubscribe().catch(() => undefined);
    }

    let subscription: PushSubscription;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    } catch (error) {
      console.warn("[push] pushManager.subscribe failed", error);
      return {
        ok: false,
        reason: "subscribe_failed",
        detail: error instanceof Error ? error.message : String(error),
      };
    }

    const json = subscription.toJSON();
    if (!json.keys?.p256dh || !json.keys?.auth || !subscription.endpoint) {
      return { ok: false, reason: "missing_subscription_keys" };
    }

    let response: Response;
    try {
      response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.warn("[push] POST /api/push/subscribe failed", error);
      return { ok: false, reason: "persist_unreachable" };
    }

    if (response.ok) {
      return { ok: true, reason: "ok" };
    }

    const body = (await response.json().catch(() => null)) as {
      reason?: string;
    } | null;
    console.warn("[push] persist rejected", response.status, body);

    if (response.status === 401) {
      return { ok: false, reason: "persist_unauthorized" };
    }
    if (response.status === 400) {
      return { ok: false, reason: "persist_invalid" };
    }
    return {
      ok: false,
      reason: "persist_failed",
      detail: body?.reason ?? `HTTP ${response.status}`,
    };
  } catch (error) {
    console.warn("[push] enablePushSubscription unexpected error", error);
    return {
      ok: false,
      reason: "subscribe_failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
