import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:ops@murmur.studio";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type PushPayload = {
  type: "RUN_DONE" | "RUN_FAILED";
  runId: string;
  recordingId?: string | null;
  title?: string;
  body?: string;
  url?: string;
};

export type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushSendFailure = {
  endpoint: string;
  statusCode?: number;
  error: string;
};

export async function sendToSubscriptions(
  subscriptions: StoredSubscription[],
  payload: PushPayload
): Promise<{ goneEndpoints: string[]; failed: PushSendFailure[] }> {
  ensureConfigured();
  const goneEndpoints: string[] = [];
  const failed: PushSendFailure[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          goneEndpoints.push(subscription.endpoint);
          return;
        }
        failed.push({
          endpoint: subscription.endpoint,
          statusCode,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })
  );

  return { goneEndpoints, failed };
}
