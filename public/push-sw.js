/* Push + notification handlers.
 * Used both as:
 * - importScripts target for next-pwa's generated SW (production builds)
 * - a standalone SW registered by lib/push/client when no SW exists yet
 *   (dev, or when next-pwa didn't register — e.g. Turbopack)
 */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const activeRunsByClient = new Map();

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.kind !== "active-run-state") return;

  const clientId = event.source?.id;
  if (!clientId) return;

  if (message.active && message.runId) {
    activeRunsByClient.set(clientId, message.runId);
    return;
  }

  activeRunsByClient.delete(clientId);
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Listener";
  const body =
    payload.body ||
    (payload.type === "RUN_FAILED"
      ? "A run needs your attention."
      : "Your project is ready.");
  const url = payload.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const focusedOnRun = clientsList.some(
        (client) => activeRunsByClient.get(client.id) === payload.runId
      );

      if (focusedOnRun) {
        clientsList.forEach((client) =>
          client.postMessage({ kind: "push-suppressed", payload })
        );
        return;
      }

      await self.registration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: payload.runId ? `run-${payload.runId}` : "listener-run",
        data: { url },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = clientsList.find((client) => "focus" in client);

      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await existing.navigate(target);
        return;
      }

      await self.clients.openWindow(target);
    })()
  );
});
